---
goal: Implement Tesseract.js for Payment Slip OCR (Not Isi Pintar)
version: 2.0
date_created: 2026-07-19
last_updated: 2026-07-19
owner: DPMM Johor Development Team
status: Planned
tags: feature, ocr, payment-slip, vision-llm
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan outlines the Tesseract.js integration for payment slip OCR in the DPMM Johor membership management system. **Important**: Tesseract.js is NOT suitable for Isi Pintar (IC/SSM document understanding). Isi Pintar will continue using the Groq vision API (qwen/qwen3.6-27b) for structured data extraction. Tesseract.js will only be used for payment slip OCR (extracting transaction IDs, amounts, dates from simple printed text).

## Critical Distinction: Tesseract.js vs VLM

**Tesseract.js (Traditional OCR):**
- Extracts raw text from images
- Good for clean printed text (payment slips, receipts)
- Cannot understand document structure or semantics
- Cannot extract structured JSON data
- 34.4% accuracy on document understanding benchmarks

**Vision LLM (Groq qwen/qwen3.6-27b):**
- Understands document structure and semantics
- Can extract structured JSON from complex documents
- Handles IC and SSM document layouts
- Required for Isi Pintar functionality

**Use Case Allocation:**
- **Payment Slip OCR**: Tesseract.js (simple text extraction)
- **Isi Pintar (IC/SSM)**: Groq VLM (structured data extraction)

## 1. Requirements & Constraints

### Payment Slip OCR (Tesseract.js Scope)
- **REQ-001**: Implement Tesseract.js for payment slip OCR (transaction ID, amount, date extraction)
- **REQ-002**: Reduce OCR processing time to under 5 seconds for typical payment slip images
- **REQ-003**: Implement proper error handling and user feedback for OCR failures
- **REQ-004**: Support English language text recognition (payment slips are typically English)
- **REQ-005**: Optimize worker reuse to prevent memory leaks in browser
- **REQ-006**: Implement image preprocessing to enhance OCR accuracy
- **SEC-001**: Ensure all OCR processing happens client-side (no server-side image upload)
- **SEC-002**: Validate OCR results before storing in database
- **CON-001**: Must work in browser environment (GitHub Pages deployment)
- **CON-002**: Must not require backend server or GPU infrastructure
- **CON-003**: Must maintain compatibility with existing receipt-pv-ui.js component
- **GUD-001**: Follow existing code patterns in the project
- **PAT-001**: Use async/await pattern for all OCR operations
- **PAT-002**: Implement proper cleanup with worker.terminate()

### Isi Pintar (VLM Scope - Out of Scope for Tesseract.js)
- **REQ-OUT-001**: Isi Pintar will continue using Groq vision API (qwen/qwen3.6-27b)
- **REQ-OUT-002**: Tesseract.js is NOT suitable for IC/SSM document understanding
- **REQ-OUT-003**: Tesseract.js cannot extract structured JSON from complex documents
- **REQ-OUT-004**: Tesseract.js cannot understand document layout or semantics
- **REQ-OUT-005**: Isi Pintar requires VLM capabilities (currently working with Groq)

## 2. Implementation Steps

### Implementation Phase 1: Current State Analysis

- GOAL-001: Analyze existing OCR implementation in receipt-pv-ui.js

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Locate and review receipt-pv-ui.js file for current OCR implementation | | | |
| TASK-002 | Identify if Tesseract.js is currently implemented or if OCR is a placeholder | | | |
| TASK-003 | Document current OCR configuration (language, parameters, output formats) | | | |
| TASK-004 | Identify performance bottlenecks in current implementation | | | |
| TASK-005 | Document error handling patterns and user feedback mechanisms | | | |

### Implementation Phase 2: Tesseract.js Implementation for Payment Slip OCR

- GOAL-002: Implement Tesseract.js for payment slip text extraction

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Add Tesseract.js CDN script to receipt-pv-ui.js if not present | | | |
| TASK-007 | Implement Tesseract.js worker initialization with English language | | | |
| TASK-008 | Create OCR function to extract text from payment slip images | | | |
| TASK-009 | Implement text parsing to extract transaction ID, amount, date from OCR output | | | |
| TASK-010 | Add OCR result validation (confidence score threshold > 60%) | | | |

### Implementation Phase 3: Image Preprocessing Enhancement

- GOAL-003: Implement image preprocessing to improve OCR accuracy

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | Add image quality check function (resolution, brightness, contrast) | | | |
| TASK-012 | Implement image preprocessing pipeline (grayscale, binarization, noise reduction) | | | |
| TASK-013 | Add image rotation detection and correction for skewed payment slips | | | |
| TASK-014 | Implement image resizing to optimal DPI (300-400 DPI for OCR) | | | |
| TASK-015 | Add image format validation (PNG, JPEG support) | | | |
| TASK-014 | Implement proper worker cleanup on component unmount | | | |
| TASK-015 | Add worker health monitoring and auto-recovery for failed workers | | | |

### Implementation Phase 4: OCR Configuration Optimization

- GOAL-004: Optimize Tesseract.js parameters for payment slip OCR

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-016 | Configure optimal Page Segmentation Mode (PSM) for payment slips | | | |
| TASK-017 | Set appropriate OEM (OCR Engine Mode) for best accuracy | | | |
| TASK-018 | Configure character whitelist for payment slip text (numbers, letters, symbols) | | | |
| TASK-019 | Implement language data caching to avoid repeated downloads | | | |
| TASK-020 | Add support for both English (eng) and Malay (msm) language data | | | |

### Implementation Phase 5: Error Handling & User Feedback

- GOAL-005: Implement comprehensive error handling and user feedback

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-021 | Add try-catch blocks around all OCR operations with specific error messages | | | |
| TASK-022 | Implement user-friendly error messages for common OCR failures | | | |
| TASK-023 | Add OCR progress indicator with percentage completion | | | |
| TASK-024 | Implement retry logic for transient OCR failures (max 3 retries) | | | |
| TASK-025 | Add OCR result validation (confidence score threshold > 60%) | | | |
| TASK-026 | Implement fallback to manual text entry if OCR fails completely | | | |

### Implementation Phase 6: Performance Optimization

- GOAL-006: Optimize OCR processing time to under 5 seconds

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-027 | Implement image compression before OCR processing | | | |
| TASK-028 | Add OCR timeout mechanism (10 second timeout) | | | |
| TASK-029 | Optimize worker initialization with preloaded language data | | | |
| TASK-030 | Implement result caching for repeated OCR of same image | | | |
| TASK-031 | Add performance metrics logging (processing time, memory usage) | | | |

### Implementation Phase 7: Testing & Validation

- GOAL-007: Validate OCR improvements with comprehensive testing

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-032 | Create test suite with sample Malaysian payment slip images | | | |
| TASK-033 | Test OCR accuracy with various payment slip formats (Maybank, CIMB, RHB) | | | |
| TASK-034 | Measure OCR processing time before and after optimization | | | |
| TASK-035 | Test error handling with corrupted or invalid images | | |
| TASK-036 | Test memory usage and worker cleanup in browser | | | |
| TASK-037 | Validate Malay language OCR support | | | |
| TASK-038 | Test on mobile browsers (Chrome Mobile, Safari Mobile) | | | |

### Implementation Phase 8: Documentation & Deployment

- GOAL-008: Document changes and deploy to production

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-039 | Update receipt-pv-ui.js code comments with OCR configuration details | | | |
| TASK-040 | Create user guide for optimal payment slip image capture | | | |
| TASK-041 | Update project README with Tesseract.js optimization details | | | |
| TASK-042 | Commit changes to Git with descriptive commit message | | | |
| TASK-043 | Push changes to GitHub main branch | | | |
| TASK-044 | Verify deployment on GitHub Pages | | | |
| TASK-045 | Conduct smoke test on live application | | | |

## 3. Alternatives

- **ALT-001**: PaddleOCR.js - Considered but rejected due to additional PaddlePaddle framework dependency and larger bundle size
- **ALT-002**: Server-side Tesseract - Rejected due to requirement for client-side processing (GitHub Pages deployment)
- **ALT-003**: DeepSeek-OCR - Rejected due to GPU requirements and Python-only implementation
- **ALT-004**: Native Tesseract C++ - Rejected due to compilation requirements and lack of browser support

## 4. Dependencies

- **DEP-001**: Tesseract.js v5.x (current version with improved memory management)
- **DEP-002**: receipt-pv-ui.js component (existing file to be modified)
- **DEP-003**: index.html (main application file that includes receipt-pv-ui.js)
- **DEP-004**: Tesseract language data files (eng.traineddata, msm.traineddata)
- **DEP-005**: Modern browser with WebAssembly support (Chrome 90+, Firefox 88+, Safari 14+)

## 5. Files

- **FILE-001**: receipt-pv-ui.js - Main receipt and payment voucher UI component with OCR functionality
- **FILE-002**: index.html - Main application file (may need script tag updates)
- **FILE-003**: docs/ocr-optimization-guide.md - New documentation file for OCR best practices
- **FILE-004**: README.md - Project README to be updated with OCR optimization details

## 6. Testing

- **TEST-001**: Unit test for image preprocessing functions
- **TEST-002**: Integration test for worker pool management
- **TEST-003**: End-to-end test for OCR workflow with sample payment slip images
- **TEST-004**: Performance test to verify <5 second processing time
- **TEST-005**: Memory leak test to verify worker cleanup
- **TEST-006**: Cross-browser compatibility test (Chrome, Firefox, Safari, Edge)
- **TEST-007**: Mobile browser test (iOS Safari, Android Chrome)
- **TEST-008**: Error handling test with invalid/corrupted images
- **TEST-009**: Language support test (English and Malay)

## 7. Risks & Assumptions

- **RISK-001**: Tesseract.js language data download may fail on slow network connections
- **RISK-002**: WebAssembly memory limits on mobile browsers may cause OCR failures
- **RISK-003**: Payment slip image quality variations may affect OCR accuracy
- **RISK-004**: Worker pool may cause memory issues on low-end devices
- **ASSUMPTION-001**: Users will have modern browsers with WebAssembly support
- **ASSUMPTION-002**: Payment slips will be primarily in English or Malay language
- **ASSUMPTION-003**: Users will capture payment slips with reasonable quality (not blurry)
- **ASSUMPTION-004**: Network connectivity is available for initial language data download

## 8. Related Specifications / Further Reading

- Tesseract.js Documentation: https://github.com/naptha/tesseract.js
- Tesseract.js Performance Guide: https://github.com/naptha/tesseract.js/blob/main/docs/performance.md
- OCR Best Practices: https://tesseract.projectnaptha.com/
- Project README: c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\README.md
- Receipt & Payment Voucher Component: c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\receipt-pv-ui.js
