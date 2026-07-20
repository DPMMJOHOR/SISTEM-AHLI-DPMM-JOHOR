import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import nodemailer from 'https://esm.sh/nodemailer@6.9.7';

// Environment variables
const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587');
const SMTP_USER = Deno.env.get('SMTP_USER');
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD');
const SMTP_FROM = Deno.env.get('SMTP_FROM') || SMTP_USER;

// Rate limiting: simple in-memory store (for production, use Redis)
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 emails per minute

// Rate limiter function
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(identifier) || [];
  
  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (validTimestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  validTimestamps.push(now);
  rateLimitStore.set(identifier, validTimestamps);
  return true;
}

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // TLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // For Gmail
  }
});

// Admin email template
function getAdminEmailTemplate(data: any) {
  return {
    subject: `Permohonan Keahlian Baru - ${data.ref_id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Permohonan Keahlian Baru Diterima</h2>
        <p>Permohonan keahlian baharu telah diterima melalui sistem dalam talian.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f7fafc;">
            <td style="padding: 10px; font-weight: bold;">No. Rujukan:</td>
            <td style="padding: 10px;">${data.ref_id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Nama Syarikat:</td>
            <td style="padding: 10px;">${data.nama_entiti || '-'}</td>
          </tr>
          <tr style="background: #f7fafc;">
            <td style="padding: 10px; font-weight: bold;">Nama Pemohon:</td>
            <td style="padding: 10px;">${data.nama_lengkap_pemohon || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">No. MyKad:</td>
            <td style="padding: 10px;">${data.no_kad_pengenal || '-'}</td>
          </tr>
          <tr style="background: #f7fafc;">
            <td style="padding: 10px; font-weight: bold;">Jenis Keahlian:</td>
            <td style="padding: 10px;">${data.jenis_keahlian_label || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">IP Address:</td>
            <td style="padding: 10px;">${data.ip_address || '-'}</td>
          </tr>
        </table>
        
        <p><strong>Nota:</strong> E-mel ini adalah pengesahan penerimaan sahaja dan BUKAN kelulusan automatik. Permohonan ini tertakluk kepada pertimbangan Jawatankuasa DPMM Negeri Johor (Fasal 7.1).</p>
        
        <p>Sila log masuk ke sistem admin untuk semak permohonan ini.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #718096;">E-mel ini dijana secara automatik oleh Sistem Keahlian DPMM Negeri Johor.</p>
      </div>
    `
  };
}

// Applicant email template
function getApplicantEmailTemplate(data: any) {
  return {
    subject: `Pengesahan Penerimaan Permohonan - ${data.ref_id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Permohonan Anda Berjaya Dihantar</h2>
        <p>Terima kasih kerana menghantar permohonan keahlian DPMM Negeri Johor.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f7fafc;">
            <td style="padding: 10px; font-weight: bold;">No. Rujukan:</td>
            <td style="padding: 10px;">${data.ref_id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Nama Syarikat:</td>
            <td style="padding: 10px;">${data.nama_entiti || '-'}</td>
          </tr>
          <tr style="background: #f7fafc;">
            <td style="padding: 10px; font-weight: bold;">Tarikh Hantar:</td>
            <td style="padding: 10px;">${new Date(data.submitted_at).toLocaleDateString('ms-MY')}</td>
          </tr>
        </table>
        
        <h3 style="color: #1a365d; margin-top: 30px;">Langkah Seterusnya:</h3>
        <ol style="line-height: 1.8;">
          <li>Muat turun & cetak borang PDF yang dilampirkan</li>
          <li>Tandatangan & cop syarikat pada borang</li>
          <li>Lengkapkan Akuan Berkanun di hadapan Pesuruhjaya Sumpah</li>
          <li>Serahkan dokumen asal ke pejabat DPMM Negeri Johor</li>
        </ol>
        
        <p><strong>Penting:</strong> E-mel ini adalah pengesahan penerimaan sahaja dan BUKAN kelulusan automatik. Permohonan ini tertakluk kepada pertimbangan Jawatankuasa DPMM Negeri Johor (Fasal 7.1). Keputusan muktamad akan dimaklumkan kemudian.</p>
        
        <p>Sila simpan no. rujukan ini untuk semak status permohonan anda.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #718096;">E-mel ini dijana secara automatik oleh Sistem Keahlian DPMM Negeri Johor.</p>
      </div>
    `
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  try {
    const { recipient_type, pdf_url, applicant_data } = await req.json();

    if (!recipient_type || !applicant_data) {
      return new Response(JSON.stringify({ error: 'recipient_type and applicant_data are required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Rate limiting by IP address (from applicant_data)
    const identifier = applicant_data.ip_address || 'unknown';
    if (!checkRateLimit(identifier)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get email template based on recipient type
    let emailTemplate;
    let toEmail;

    if (recipient_type === 'admin') {
      emailTemplate = getAdminEmailTemplate(applicant_data);
      toEmail = 'dpmmnj.pengurusan@gmail.com';
    } else if (recipient_type === 'applicant') {
      emailTemplate = getApplicantEmailTemplate(applicant_data);
      toEmail = applicant_data.emel_syarikat || applicant_data.proksi_emel;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid recipient_type. Must be "admin" or "applicant"' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!toEmail) {
      return new Response(JSON.stringify({ error: 'Recipient email not found' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Build email options
    const mailOptions: any = {
      from: SMTP_FROM,
      to: toEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    // Add PDF attachment if URL is provided
    if (pdf_url) {
      try {
        // Fetch PDF from Supabase Storage
        const pdfResponse = await fetch(pdf_url);
        if (!pdfResponse.ok) {
          throw new Error('Failed to fetch PDF from storage');
        }
        const pdfBuffer = await pdfResponse.arrayBuffer();
        
        mailOptions.attachments = [{
          filename: `Borang_Permohonan_${applicant_data.ref_id}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf'
        }];
      } catch (pdfError) {
        console.error('Failed to attach PDF:', pdfError);
        // Continue without PDF attachment
      }
    }

    // Send email with retry logic
    let emailSent = false;
    let lastError = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries && !emailSent; attempt++) {
      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log(`Email sent successfully to ${toEmail} (attempt ${attempt + 1})`);
      } catch (error) {
        lastError = error;
        console.error(`Email send attempt ${attempt + 1} failed:`, error);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    if (!emailSent) {
      throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError?.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully' 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
