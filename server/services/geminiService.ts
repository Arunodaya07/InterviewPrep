import { GoogleGenAI, Type } from '@google/genai';
import zlib from 'zlib';
import {
  InterviewDimensionAverages,
  ResumeSectionBreakdown,
} from '../../src/utils/recommendationEngine.ts';

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateContentWithModelFallback(params: {
  contents: any;
  config: any;
}) {
  const ai = getAiClient();
  const models = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-3-flash-preview',
  ];
  let lastErr: unknown;
  for (const modelName of models) {
    try {
      return await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config,
      });
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export interface GeminiResumeEvaluation {
  isValidResume: boolean;
  validationMessage?: string;
  candidateName?: string;
  detectedEducation?: string;
  detectedProjects?: string[];
  roleMatchPercentage?: number;
  sectionBreakdown?: ResumeSectionBreakdown;
  resumeScore: number;
  skillsFound: string[];
  missingSkills: string[];
  strengths: string[];
  areasToImprove: string[];
  suggestedSkills: string[];
  suggestedImprovements: string[];
  summary: string;
}

export interface GeminiAnswerEvaluation {
  scoreOutOf10: number;
  technicalCorrectness: number;
  relevance: number;
  clarity: number;
  communication: number;
  completeness: number;
  wordCount: number;
  conceptsCovered: string[];
  conceptsMissed: string[];
  clarityAndCommunicationNote: string;
  feedback: string;
  improvementSuggestion: string;
  idealAnswerKeyPoints: string[];
  sampleIdealAnswer: string;
  nextQuestion?: string;
  nextTopic?: string;
  nextHint?: string;
}

export interface GeminiInterviewCompletion {
  overallScore: number;
  performanceBand: string;
  dimensionAverages: InterviewDimensionAverages;
  strongAreas: string[];
  weakAreas: string[];
  suggestions: string[];
}

export const ROLE_BENCHMARKS: Record<string, string[]> = {
  'Software Developer': [
    'Java',
    'Python',
    'Data Structures',
    'Algorithms',
    'OOP',
    'SQL',
    'DBMS',
    'Git',
    'REST APIs',
    'Operating Systems',
  ],
  'Java Developer': [
    'Java',
    'OOP',
    'Spring Boot',
    'Hibernate / JPA',
    'SQL',
    'DBMS',
    'REST APIs',
    'Multithreading',
    'Maven / Gradle',
    'JUnit',
  ],
  'Python Developer': [
    'Python',
    'Data Structures',
    'Django / FastAPI / Flask',
    'SQL',
    'OOP',
    'REST APIs',
    'Git',
    'Unit Testing',
    'Linux',
  ],
  'Frontend Developer': [
    'HTML5',
    'CSS3',
    'JavaScript',
    'TypeScript',
    'React.js',
    'Tailwind CSS',
    'Responsive Design',
    'REST APIs',
    'Git',
    'Web Performance',
  ],
  'Backend Developer': [
    'Node.js',
    'Express.js',
    'Java / Python',
    'SQL',
    'DBMS',
    'MongoDB',
    'REST APIs',
    'Authentication / JWT',
    'Git',
    'Docker',
  ],
  'Data Analyst': [
    'Python',
    'SQL',
    'DBMS',
    'Pandas',
    'NumPy',
    'Data Visualization',
    'Statistics',
    'Excel',
    'Power BI / Tableau',
  ],
  'QA Engineer': [
    'Software Testing',
    'Selenium / Playwright',
    'Java / Python',
    'API Testing (Postman)',
    'SQL',
    'Test Case Design',
    'CI/CD',
    'Bug Tracking',
  ],
};

const COMPREHENSIVE_SKILL_CATALOG: Array<{ canonical: string; patterns: RegExp[] }> = [
  { canonical: 'Java', patterns: [/\bjava\b/i] },
  { canonical: 'Python', patterns: [/\bpython\b/i] },
  { canonical: 'C', patterns: [/\bc\b(?![+#])/i, /\bc programming\b/i] },
  { canonical: 'C++', patterns: [/\bc\+\+/i, /\bcpp\b/i] },
  { canonical: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i, /\bes6\b/i] },
  { canonical: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
  { canonical: 'SQL', patterns: [/\bsql\b/i, /\bmysql\b/i, /\bpostgresql\b/i, /\bpostgres\b/i, /\bsqlite\b/i, /\boracle\b/i] },
  { canonical: 'MySQL', patterns: [/\bmysql\b/i] },
  { canonical: 'PostgreSQL', patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
  { canonical: 'MongoDB', patterns: [/\bmongodb\b/i, /\bmongo\b/i, /\bnosql\b/i] },
  { canonical: 'React.js', patterns: [/\breact(?:\.js|js)?\b/i] },
  { canonical: 'Node.js', patterns: [/\bnode(?:\.js|js)?\b/i] },
  { canonical: 'Express.js', patterns: [/\bexpress(?:\.js|js)?\b/i] },
  { canonical: 'Next.js', patterns: [/\bnext(?:\.js|js)?\b/i] },
  { canonical: 'Angular', patterns: [/\bangular\b/i] },
  { canonical: 'Vue.js', patterns: [/\bvue(?:\.js|js)?\b/i] },
  { canonical: 'HTML5', patterns: [/\bhtml5?\b/i] },
  { canonical: 'CSS3', patterns: [/\bcss3?\b/i] },
  { canonical: 'Tailwind CSS', patterns: [/\btailwind(?:\s*css)?\b/i] },
  { canonical: 'Bootstrap', patterns: [/\bbootstrap\b/i] },
  { canonical: 'Spring Boot', patterns: [/\bspring\s*boot\b/i, /\bspring\s*framework\b/i] },
  { canonical: 'Hibernate / JPA', patterns: [/\bhibernate\b/i, /\bjpa\b/i, /\bjdbc\b/i] },
  { canonical: 'Django / FastAPI / Flask', patterns: [/\bdjango\b/i, /\bfastapi\b/i, /\bflask\b/i] },
  { canonical: 'Data Structures', patterns: [/\bdata\s*structures?\b/i, /\bdsa\b/i] },
  { canonical: 'Algorithms', patterns: [/\balgorithms?\b/i, /\bdsa\b/i, /\bleetcode\b/i] },
  { canonical: 'OOP', patterns: [/\boops?\b/i, /\bobject[\s-]oriented\b/i] },
  { canonical: 'DBMS', patterns: [/\bdbms\b/i, /\bdatabase\s*management\b/i, /\brelational\s*database\b/i] },
  { canonical: 'Operating Systems', patterns: [/\boperating\s*systems?\b/i, /\bos\b/i, /\blinux\b/i] },
  { canonical: 'Computer Networks', patterns: [/\bcomputer\s*networks?\b/i, /\btcp\/ip\b/i, /\bnetworking\b/i] },
  { canonical: 'REST APIs', patterns: [/\brest(?:ful)?\s*apis?\b/i, /\bapi\s*development\b/i, /\bgraphql\b/i] },
  { canonical: 'Git', patterns: [/\bgit\b/i, /\bgithub\b/i, /\bgitlab\b/i] },
  { canonical: 'Linux', patterns: [/\blinux\b/i, /\bubuntu\b/i, /\bbash\b/i, /\bunix\b/i] },
  { canonical: 'Docker', patterns: [/\bdocker\b/i, /\bcontainerization\b/i] },
  { canonical: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { canonical: 'AWS / Cloud', patterns: [/\baws\b/i, /\bamazon\s*web\s*services\b/i, /\bgcp\b/i, /\bazure\b/i, /\bcloud\b/i] },
  { canonical: 'Firebase', patterns: [/\bfirebase\b/i, /\bfirestore\b/i] },
  { canonical: 'Machine Learning', patterns: [/\bmachine\s*learning\b/i, /\bdeep\s*learning\b/i, /\bscikit[\s-]learn\b/i, /\btensorflow\b/i, /\bpytorch\b/i] },
  { canonical: 'Pandas', patterns: [/\bpandas\b/i] },
  { canonical: 'NumPy', patterns: [/\bnumpy\b/i] },
  { canonical: 'Data Visualization', patterns: [/\bmatplotlib\b/i, /\bseaborn\b/i, /\bdata\s*visualization\b/i] },
  { canonical: 'Power BI / Tableau', patterns: [/\bpower\s*bi\b/i, /\btableau\b/i] },
  { canonical: 'Excel', patterns: [/\bexcel\b/i, /\bspreadsheets?\b/i] },
  { canonical: 'Statistics', patterns: [/\bstatistics\b/i, /\bstatistical\b/i, /\bprobability\b/i] },
  { canonical: 'Software Testing', patterns: [/\bsoftware\s*testing\b/i, /\bmanual\s*testing\b/i, /\bautomation\s*testing\b/i, /\bqa\b/i] },
  { canonical: 'Selenium / Playwright', patterns: [/\bselenium\b/i, /\bplaywright\b/i, /\bcypress\b/i] },
  { canonical: 'API Testing (Postman)', patterns: [/\bpostman\b/i, /\bapi\s*testing\b/i, /\brest\s*assured\b/i] },
  { canonical: 'JUnit', patterns: [/\bjunit\b/i, /\bpytest\b/i, /\bjest\b/i, /\bunit\s*testing\b/i] },
  { canonical: 'Maven / Gradle', patterns: [/\bmaven\b/i, /\bgradle\b/i] },
  { canonical: 'Multithreading', patterns: [/\bmultithreading\b/i, /\bconcurrency\b/i] },
  { canonical: 'Authentication / JWT', patterns: [/\bjwt\b/i, /\boauth\b/i, /\bauthentication\b/i] },
  { canonical: 'Responsive Design', patterns: [/\bresponsive\b/i, /\bflexbox\b/i, /\bcss\s*grid\b/i] },
  { canonical: 'CI/CD', patterns: [/\bci\/cd\b/i, /\bjenkins\b/i, /\bgithub\s*actions\b/i] },
];

/**
 * Extracts text from PDF buffer by decompressing FlateDecode streams using Node's zlib
 * as well as parsing uncompressed PDF text operators.
 */
export function extractRawTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const raw = buffer.toString('latin1');
    const extractedPieces: string[] = [];

    const decodePdfString = (str: string) =>
      str
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .replace(/[^\x20-\x7E\n]/g, ' ');

    const decodeHexPdfString = (hexStr: string): string => {
      const cleanHex = hexStr.replace(/[^0-9A-Fa-f]/g, '');
      if (!cleanHex) return '';
      // Check if UTF-16BE (4 hex chars per character, often starting with 00 for ASCII)
      if (cleanHex.length % 4 === 0 && /00[2-7][0-9A-Fa-f]/.test(cleanHex)) {
        let out = '';
        for (let i = 0; i < cleanHex.length; i += 4) {
          const code = parseInt(cleanHex.slice(i, i + 4), 16);
          if (code >= 32 && code <= 126) out += String.fromCharCode(code);
          else if (code === 10 || code === 13) out += '\n';
        }
        return out;
      }
      let out = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        const code = parseInt(cleanHex.slice(i, i + 2), 16);
        if (code >= 32 && code <= 126) out += String.fromCharCode(code);
      }
      return out;
    };

    const extractTextFromContentStream = (streamContent: string) => {
      // 1. Extract Tj literals: (text) Tj
      const tjRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g;
      let m: RegExpExecArray | null;
      const singleStreamTokens: string[] = [];
      while ((m = tjRegex.exec(streamContent)) !== null) {
        const cleaned = decodePdfString(m[1]);
        if (cleaned) singleStreamTokens.push(cleaned);
      }

      // 1b. Extract Hex Tj literals: <hex> Tj
      const hexTjRegex = /<([0-9A-Fa-f\s]+)>\s*Tj/g;
      while ((m = hexTjRegex.exec(streamContent)) !== null) {
        const decoded = decodeHexPdfString(m[1]).trim();
        if (decoded) singleStreamTokens.push(decoded);
      }

      // 2. Extract TJ arrays: [(text) -20 (more) <hex>] TJ
      const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
      while ((m = tjArrayRegex.exec(streamContent)) !== null) {
        const inner = m[1];
        const tokenRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)|<([0-9A-Fa-f\s]+)>/g;
        let tokMatch: RegExpExecArray | null;
        const lineParts: string[] = [];
        while ((tokMatch = tokenRegex.exec(inner)) !== null) {
          if (tokMatch[1] !== undefined) {
            lineParts.push(decodePdfString(tokMatch[1]));
          } else if (tokMatch[2] !== undefined) {
            lineParts.push(decodeHexPdfString(tokMatch[2]));
          }
        }
        if (lineParts.length > 0) {
          singleStreamTokens.push(lineParts.join(''));
        }
      }

      if (singleStreamTokens.length > 0) {
        // Stitch single-character runs seamlessly
        let combined = '';
        for (const tok of singleStreamTokens) {
          if (tok.length === 1 && /[A-Za-z0-9@._+-]/.test(tok)) {
            combined += tok;
          } else {
            combined += ' ' + tok + ' ';
          }
        }
        extractedPieces.push(combined);
      }

      // 3. Fallback general parenthesized literals inside stream
      if (extractedPieces.length < 10) {
        const parenRegex = /\(([^()\\]{2,220})\)/g;
        while ((m = parenRegex.exec(streamContent)) !== null) {
          const cleaned = decodePdfString(m[1]).trim();
          if (cleaned.length > 1 && /[a-zA-Z]{2,}/.test(cleaned)) {
            extractedPieces.push(cleaned);
          }
        }
      }
    };

    // Locate all PDF stream ... endstream blocks and attempt zlib decompression
    let searchPos = 0;
    while (searchPos < raw.length) {
      const streamIdx = raw.indexOf('stream', searchPos);
      if (streamIdx === -1) break;
      const endStreamIdx = raw.indexOf('endstream', streamIdx + 6);
      if (endStreamIdx === -1) break;

      let dataStart = streamIdx + 6;
      if (raw[dataStart] === '\r' && raw[dataStart + 1] === '\n') dataStart += 2;
      else if (raw[dataStart] === '\n' || raw[dataStart] === '\r') dataStart += 1;

      let dataEnd = endStreamIdx;
      if (raw[dataEnd - 2] === '\r' && raw[dataEnd - 1] === '\n') dataEnd -= 2;
      else if (raw[dataEnd - 1] === '\n' || raw[dataEnd - 1] === '\r') dataEnd -= 1;

      if (dataEnd > dataStart && dataEnd - dataStart < 2 * 1024 * 1024) {
        const subBuf = buffer.subarray(dataStart, dataEnd);
        try {
          const inflated = zlib.inflateSync(subBuf).toString('latin1');
          extractTextFromContentStream(inflated);
        } catch {
          try {
            const inflatedRaw = zlib.inflateRawSync(subBuf).toString('latin1');
            extractTextFromContentStream(inflatedRaw);
          } catch {
            // Not Flate-compressed or custom filter; scan directly
            extractTextFromContentStream(subBuf.toString('latin1'));
          }
        }
      }
      searchPos = endStreamIdx + 9;
    }

    // Also run on top-level uncompressed PDF content
    extractTextFromContentStream(raw);

    const joined = extractedPieces.join(' ').replace(/\s+/g, ' ').trim();
    if (joined.length > 40) {
      return joined.slice(0, 15000);
    }

    // Fallback printable ASCII scan excluding PDF structural keywords
    const asciiMatches = raw.match(/[A-Za-z0-9@.,:/\-_+#() ]{4,}/g) || [];
    return asciiMatches
      .filter(
        (s) =>
          !/^(obj|endobj|stream|endstream|xref|trailer|Type|Font|Page|Filter|FlateDecode|Length|Resources|ProcSet|MediaBox)/i.test(
            s.trim()
          )
      )
      .join(' ')
      .replace(/\s+/g, ' ')
      .slice(0, 12000);
  } catch {
    return '';
  }
}

/**
 * Extracts clean text from a .docx (ZIP archive containing word/document.xml) buffer.
 */
export function extractTextFromDocxBuffer(buffer: Buffer): string {
  try {
    let offset = 0;
    const extractedXmls: string[] = [];

    while (offset + 30 < buffer.length) {
      // Local file header signature = 0x04034b50 (PK\x03\x04)
      if (
        buffer[offset] !== 0x50 ||
        buffer[offset + 1] !== 0x4b ||
        buffer[offset + 2] !== 0x03 ||
        buffer[offset + 3] !== 0x04
      ) {
        offset += 1;
        continue;
      }

      const compressionMethod = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const fileNameLength = buffer.readUInt16LE(offset + 26);
      const extraFieldLength = buffer.readUInt16LE(offset + 28);

      const fileNameStart = offset + 30;
      const fileName = buffer
        .subarray(fileNameStart, fileNameStart + fileNameLength)
        .toString('utf-8');
      const dataStart = fileNameStart + fileNameLength + extraFieldLength;
      const dataEnd = dataStart + compressedSize;

      if (
        fileName.startsWith('word/document') &&
        fileName.endsWith('.xml') &&
        dataEnd <= buffer.length &&
        compressedSize > 0
      ) {
        const compressedData = buffer.subarray(dataStart, dataEnd);
        if (compressionMethod === 0) {
          extractedXmls.push(compressedData.toString('utf-8'));
        } else if (compressionMethod === 8) {
          try {
            const xml = zlib.inflateRawSync(compressedData).toString('utf-8');
            extractedXmls.push(xml);
          } catch {
            // ignore corrupt entry
          }
        }
      }

      offset = dataEnd > offset + 30 ? dataEnd : offset + 30;
    }

    if (extractedXmls.length > 0) {
      const combinedXml = extractedXmls.join('\n');
      return combinedXml
        .replace(/<\/w:p>/g, '\n')
        .replace(/<w:tab\/>/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim()
        .slice(0, 15000);
    }

    return buffer
      .toString('utf-8')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000);
  } catch {
    return '';
  }
}

/**
 * Deterministic check to verify if extracted text is genuinely a Resume / CV
 * vs a non-resume document (e.g., question paper, syllabus, code file, random notes, receipt).
 */
export function verifyResumeTextHeuristics(
  text: string,
  fileName: string
): {
  isLikelyResume: boolean;
  confidenceScore: number;
  rejectionReason?: string;
} {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const lowerFile = fileName.toLowerCase();

  // Check if file name itself explicitly says question paper, syllabus, invoice, receipt, lab manual, etc.
  const nonResumeFilePatterns = [
    /question[_\s-]*paper/i,
    /syllabus/i,
    /invoice/i,
    /receipt/i,
    /bill/i,
    /ticket/i,
    /assignment/i,
    /lab[_\s-]*manual/i,
    /notes/i,
    /timetable/i,
  ];

  // Count resume section & content signals
  const resumeSectionSignals = [
    /\beducation\b/i,
    /\b(?:technical\s+)?skills\b/i,
    /\bprojects?\b/i,
    /\b(?:work\s+|professional\s+)?experience\b/i,
    /\binternships?\b/i,
    /\bcgpa\b|\bgpa\b|\bpercentage\b/i,
    /\bb\.?\s*tech\b|\bb\.?\s*e\b|\bm\.?\s*tech\b|\bbachelor\b|\bcomputer\s+science\b|\bengineering\b/i,
    /\bcertifications?\b|\bachievements?\b|\bawards?\b/i,
    /\b(?:career\s+)?objective\b|\b(?:professional\s+)?summary\b|\bprofile\b/i,
    /\bgithub\.com\b|\blinkedin\.com\b|\bleetcode\b|\bhackerrank\b/i,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email address
    /\b(?:\+?\d{1,3}[\s-]?)?\d{10}\b/, // Phone number
    /\bcurriculum\s+vitae\b|\bresume\b/i,
  ];

  let matchedSignals = 0;
  for (const regex of resumeSectionSignals) {
    if (regex.test(clean)) {
      matchedSignals += 1;
    }
  }

  // Non-resume content detectors (e.g., MCQ question paper, raw source code file, syllabus)
  const mcqSignals = (clean.match(/\b(?:Option\s*[A-D]|Correct\s*Answer|Q\d+\.|Question\s*\d+)/gi) || []).length;
  const codeSignals = (clean.match(/\b(?:import\s+React|function\s+\w+\(|public\s+static\s+void\s+main|#include\s*<|console\.log\()/g) || []).length;

  if (mcqSignals >= 4 && matchedSignals < 4) {
    return {
      isLikelyResume: false,
      confidenceScore: 10,
      rejectionReason:
        'The uploaded file appears to be a Question Paper / Quiz document rather than a candidate Resume/CV.',
    };
  }

  if (codeSignals >= 3 && matchedSignals < 4) {
    return {
      isLikelyResume: false,
      confidenceScore: 10,
      rejectionReason:
        'The uploaded file appears to be a source code file rather than a candidate Resume/CV.',
    };
  }

  const wordCount = clean.split(/\s+/).filter(Boolean).length;

  // If we have extracted text (>15 words) and it has almost no resume signals (<2)
  // Note: For PDF files that use custom CMap font encodings, raw extracted text may only contain PDF header words;
  // only reject if the file is NOT a PDF or if the filename/content explicitly indicates a non-resume.
  const isPdfFile = lowerFile.endsWith('.pdf');
  const looksLikePdfMetadataOnly =
    isPdfFile &&
    /\b(?:endobj|flatedecode|mediabox|xref|parent|resources|fontdescriptor|cidfont|tounicode)\b/i.test(
      clean
    ) &&
    matchedSignals < 2;

  if (nonResumeFilePatterns.some((rx) => rx.test(lowerFile)) && matchedSignals < 3) {
    return {
      isLikelyResume: false,
      confidenceScore: 20,
      rejectionReason: `The uploaded file "${fileName}" appears to be a non-resume document (e.g., syllabus, question paper, or assignment). Please upload your Resume/CV.`,
    };
  }

  if (looksLikePdfMetadataOnly || (isPdfFile && wordCount < 25 && matchedSignals < 2)) {
    // Allow CMap-encoded PDF resumes to proceed to analysis
    return {
      isLikelyResume: true,
      confidenceScore: 70,
    };
  }

  if (wordCount > 0 && wordCount < 15 && !isPdfFile) {
    return {
      isLikelyResume: false,
      confidenceScore: 15,
      rejectionReason:
        'The uploaded content is too short to be a valid Resume. A proper resume must include your Education, Technical Skills, and Projects.',
    };
  }

  if (wordCount >= 25 && matchedSignals < 2 && !looksLikePdfMetadataOnly) {
    return {
      isLikelyResume: false,
      confidenceScore: 20,
      rejectionReason:
        'The uploaded file does not contain standard Resume sections (such as Education, Technical Skills, Projects, Experience, or Contact Details). Please upload a valid Resume/CV.',
    };
  }

  return {
    isLikelyResume: matchedSignals >= 2 || isPdfFile,
    confidenceScore: Math.max(isPdfFile ? 65 : 0, Math.min(100, matchedSignals * 15)),
  };
}

/**
 * Deterministic deep resume analyzer that inspects the exact text of the uploaded resume.
 */
export function buildDeterministicResumeEvaluation(params: {
  resumeText: string;
  targetRole: string;
  fileName: string;
  studentSkills?: string[];
}): GeminiResumeEvaluation {
  const { resumeText, targetRole, fileName, studentSkills = [] } = params;
  const cleanText = resumeText.trim();
  const expectedSkills = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Software Developer'];

  // Verify if it is actually a resume
  const check = verifyResumeTextHeuristics(cleanText, fileName);
  if (!check.isLikelyResume) {
    return {
      isValidResume: false,
      validationMessage:
        check.rejectionReason ||
        'The uploaded document is not a valid Resume/CV. Please upload a resume containing your Education, Skills, and Projects.',
      resumeScore: 0,
      skillsFound: [],
      missingSkills: [],
      strengths: [],
      areasToImprove: [],
      suggestedSkills: [],
      suggestedImprovements: [],
      summary: '',
    };
  }

  // 1. Extract Candidate Name (from first line or filename)
  const lines = cleanText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] || '';
  const nameFromFile = fileName
    .replace(/\.(pdf|docx|doc|txt)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b(?:resume|cv|updated|final|new|\d+)\b/gi, '')
    .trim();
  const candidateName =
    firstLine.length > 2 &&
    firstLine.length < 45 &&
    !/resume|curriculum|vitae|email|phone|obj|stream|endobj|pdf/i.test(firstLine)
      ? firstLine
      : nameFromFile.length > 2
      ? nameFromFile
      : 'B.Tech Candidate';

  // 2. Extract Education & CGPA
  const eduMatches = lines.filter(
    (l) =>
      /\b(b\.?\s*tech|b\.?\s*e|bachelor|computer\s+science|cse|it|engineering|university|institute|college|cgpa|gpa)\b/i.test(
        l
      ) && !/obj|endobj|stream/i.test(l)
  );
  const detectedEducation =
    eduMatches.slice(0, 2).join(' · ').slice(0, 160) ||
    'B.Tech in Computer Science & Engineering';

  // 3. Extract Projects mentioned in the resume
  const projectLines: string[] = [];
  let inProjectsSection = false;
  for (const line of lines) {
    if (/^(?:academic\s+|personal\s+|technical\s+)?projects?\b/i.test(line)) {
      inProjectsSection = true;
      continue;
    }
    if (
      inProjectsSection &&
      /^(?:education|certifications?|achievements?|skills|technical\s+skills|hobbies|declaration|languages)\b/i.test(
        line
      )
    ) {
      inProjectsSection = false;
    }
    if (
      inProjectsSection &&
      line.length > 8 &&
      line.length < 140 &&
      !/obj|endobj|stream/i.test(line)
    ) {
      if (/^(?:\d+\.|•|-|\*)?\s*[A-Z]/.test(line)) {
        projectLines.push(line.replace(/^(?:\d+\.|•|-|\*)\s*/, '').trim());
      }
    }
  }

  // 4. Detect all technical skills actually present in the resume text (or fallback to profile skills if CMap PDF)
  const detectedSkillsSet = new Set<string>();
  for (const item of COMPREHENSIVE_SKILL_CATALOG) {
    if (item.patterns.some((rx) => rx.test(cleanText))) {
      detectedSkillsSet.add(item.canonical);
    }
  }
  if (detectedSkillsSet.size === 0 && studentSkills.length > 0) {
    studentSkills.forEach((s) => {
      if (s && s.trim()) detectedSkillsSet.add(s.trim());
    });
  }
  if (detectedSkillsSet.size === 0) {
    // Extract any role-related keywords from filename or default foundational CSE skills
    expectedSkills.slice(0, 4).forEach((s) => detectedSkillsSet.add(s));
  }
  const skillsFound = Array.from(detectedSkillsSet);

  // 5. Compare against Target Role Benchmarks
  const matchedBenchmarkSkills = expectedSkills.filter((bench) => {
    const benchTokens = bench
      .toLowerCase()
      .split(/[/,&\s]+/)
      .filter((t) => t.length > 1);
    return (
      skillsFound.some((sf) => sf.toLowerCase() === bench.toLowerCase()) ||
      benchTokens.some((tok) => new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(cleanText))
    );
  });

  const missingSkills = expectedSkills.filter((bench) => !matchedBenchmarkSkills.includes(bench));
  const roleMatchPercentage = Math.round(
    (matchedBenchmarkSkills.length / Math.max(1, expectedSkills.length)) * 100
  );

  // 6. Compute Section Breakdown Scores based on actual resume content
  const technicalSkillsScore = Math.min(
    100,
    Math.round(roleMatchPercentage * 0.75 + Math.min(25, skillsFound.length * 2.5))
  );

  const hasMetrics = /\b\d+%|\b\d+\+|\b\d+\s*(?:users|ms|seconds|requests|records|problems|students)/i.test(cleanText);
  const hasLinks = /github\.com|linkedin\.com|vercel\.app|netlify\.app|render\.com/i.test(cleanText);
  const projectsCountSignal = Math.max(
    projectLines.length,
    (cleanText.match(/\b(?:built|developed|implemented|designed|architected|created)\b/gi) || []).length
  );
  const projectsScore = Math.min(
    100,
    Math.max(
      30,
      Math.min(60, projectsCountSignal * 15) + (hasMetrics ? 25 : 0) + (hasLinks ? 15 : 0)
    )
  );

  const hasCgpa = /\b(?:cgpa|gpa|percentage)\s*[:=-]?\s*\d+(?:\.\d+)?/i.test(cleanText);
  const hasCodingProfiles = /\b(?:leetcode|geeksforgeeks|hackerrank|codechef|codeforces)\b/i.test(cleanText);
  const educationScore = Math.min(
    100,
    55 + (hasCgpa ? 25 : 0) + (hasCodingProfiles ? 20 : 0)
  );

  const wordCount = cleanText.split(/\s+/).length;
  const structureAndAtsScore = Math.min(
    100,
    (wordCount >= 120 && wordCount <= 900 ? 60 : 40) +
      (hasLinks ? 20 : 0) +
      (skillsFound.length >= 5 ? 20 : 10)
  );

  const resumeScore = Math.round(
    technicalSkillsScore * 0.4 +
      projectsScore * 0.3 +
      educationScore * 0.15 +
      structureAndAtsScore * 0.15
  );

  // 7. Build specific Strengths & Areas to Improve based on what was actually found/missing
  const strengths: string[] = [];
  if (matchedBenchmarkSkills.length > 0) {
    strengths.push(
      `Matches ${matchedBenchmarkSkills.length} of ${expectedSkills.length} core ${targetRole} skills (${matchedBenchmarkSkills.slice(0, 5).join(', ')})`
    );
  }
  if (hasMetrics) {
    strengths.push('Includes quantified impact metrics and numbers in project/achievement descriptions');
  }
  if (hasLinks) {
    strengths.push('Contains portfolio/GitHub/LinkedIn profile links for technical verification');
  }
  if (hasCodingProfiles) {
    strengths.push('Highlights competitive programming / DSA problem-solving platforms');
  }
  if (strengths.length === 0) {
    strengths.push(`Contains foundational academic details relevant to ${targetRole} entry-level roles`);
  }

  const areasToImprove: string[] = [];
  if (missingSkills.length > 0) {
    areasToImprove.push(
      `Missing key ${targetRole} technologies: ${missingSkills.slice(0, 4).join(', ')}`
    );
  }
  if (!hasMetrics) {
    areasToImprove.push(
      'Project descriptions lack measurable metrics (e.g., response time reduction, dataset size, or user count)'
    );
  }
  if (!hasLinks) {
    areasToImprove.push('Missing GitHub repository links or live project URLs');
  }
  if (!hasCodingProfiles) {
    areasToImprove.push('No mention of DSA problem-solving profiles (LeetCode, GeeksforGeeks, HackerRank)');
  }

  const suggestedImprovements: string[] = [
    missingSkills.length > 0
      ? `Add at least 1 hands-on project or coursework demonstrating ${missingSkills.slice(0, 3).join(', ')} for ${targetRole} alignment.`
      : `Highlight system design and scalability details in your ${targetRole} projects.`,
    !hasMetrics
      ? 'Rewrite project bullet points using the Action Verb + Technical Stack + Quantified Impact format (e.g., "Optimized SQL queries reducing API latency by 35%").'
      : 'Ensure every project lists the exact tech stack in parentheses next to the project title.',
    'Keep a dedicated "Technical Skills" section grouped by Languages, Frameworks, Databases, and Developer Tools for ATS scanners.',
  ];

  return {
    isValidResume: true,
    candidateName,
    detectedEducation,
    detectedProjects: projectLines.slice(0, 4),
    roleMatchPercentage,
    sectionBreakdown: {
      technicalSkillsScore,
      projectsScore,
      educationScore,
      structureAndAtsScore,
    },
    resumeScore,
    skillsFound: skillsFound.length > 0 ? skillsFound : matchedBenchmarkSkills,
    missingSkills,
    strengths,
    areasToImprove,
    suggestedSkills: missingSkills.slice(0, 6),
    suggestedImprovements,
    summary: `Analyzed "${fileName}" for the ${targetRole} role. Detected ${skillsFound.length} technical skills with a ${roleMatchPercentage}% target-role benchmark match and an overall readiness score of ${resumeScore}/100.`,
  };
}

export async function analyzeResumeWithGemini(params: {
  resumeText: string;
  pdfBase64?: string;
  targetRole: string;
  fileName?: string;
  studentSkills?: string[];
}): Promise<GeminiResumeEvaluation> {
  const { resumeText, pdfBase64, targetRole, fileName = 'Uploaded_Resume.pdf' } = params;
  const expectedSkills = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Software Developer'];

  // If plain text is provided without PDF or if PDF text was extracted, pre-check obvious non-resume text
  if (!pdfBase64 && resumeText.trim()) {
    const preCheck = verifyResumeTextHeuristics(resumeText, fileName);
    if (!preCheck.isLikelyResume) {
      return {
        isValidResume: false,
        validationMessage: preCheck.rejectionReason,
        resumeScore: 0,
        skillsFound: [],
        missingSkills: [],
        strengths: [],
        areasToImprove: [],
        suggestedSkills: [],
        suggestedImprovements: [],
        summary: '',
      };
    }
  }

  try {
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (pdfBase64) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      });
    }

    parts.push({
      text: `You are an expert technical recruiter and ATS resume analyzer for B.Tech Computer Science placements.
File Name: "${fileName}"
Target Role: "${targetRole}"
Required Core Competencies for "${targetRole}": ${expectedSkills.join(', ')}.
${resumeText ? `\nExtracted Text from Uploaded File:\n"""\n${resumeText.slice(0, 14000)}\n"""` : ''}

CRITICAL STEP 1 — VALIDATE IF THIS IS ACTUALLY A RESUME / CV:
Check whether the uploaded file or text is genuinely a candidate's Resume / Curriculum Vitae (containing sections such as Education, Technical Skills, Projects, Experience, Internships, or Contact Info).
- If the uploaded document is NOT a resume (for example: a question paper, quiz, syllabus, assignment, lab manual, code file, textbook, invoice, receipt, random essay, or gibberish), you MUST set "isValidResume" to false and explain what the document actually is in "validationMessage".
- Only set "isValidResume" to true if it is genuinely a Resume / CV.

CRITICAL STEP 2 — ACCURATE EXTRACTION FROM THE UPLOADED RESUME ONLY:
If "isValidResume" is true:
- Extract ONLY the technical skills, programming languages, databases, frameworks, and tools that are ACTUALLY written in this uploaded resume. Do NOT invent skills that are not in the resume.
- Compare the extracted skills against the required competencies for "${targetRole}" (${expectedSkills.join(', ')}) to compute "missingSkills" and "roleMatchPercentage" (0 to 100).
- Extract "candidateName", "detectedEducation" (degree, college, CGPA if mentioned), and "detectedProjects" (project titles found in the resume).
- Compute a realistic "sectionBreakdown":
  - technicalSkillsScore (0-100)
  - projectsScore (0-100)
  - educationScore (0-100)
  - structureAndAtsScore (0-100)
- Compute "resumeScore" (0-100) strictly reflecting the uploaded resume's quality for "${targetRole}".`,
    });

    const response = await generateContentWithModelFallback({
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidResume: {
              type: Type.BOOLEAN,
              description: 'True ONLY if the uploaded file is genuinely a candidate Resume or CV',
            },
            validationMessage: {
              type: Type.STRING,
              description: 'If isValidResume is false, explain why the uploaded file is not a valid resume',
            },
            candidateName: { type: Type.STRING },
            detectedEducation: { type: Type.STRING },
            detectedProjects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            roleMatchPercentage: { type: Type.INTEGER },
            sectionBreakdown: {
              type: Type.OBJECT,
              properties: {
                technicalSkillsScore: { type: Type.INTEGER },
                projectsScore: { type: Type.INTEGER },
                educationScore: { type: Type.INTEGER },
                structureAndAtsScore: { type: Type.INTEGER },
              },
              required: [
                'technicalSkillsScore',
                'projectsScore',
                'educationScore',
                'structureAndAtsScore',
              ],
            },
            resumeScore: { type: Type.INTEGER },
            skillsFound: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            areasToImprove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            summary: { type: Type.STRING },
          },
          required: [
            'isValidResume',
            'validationMessage',
            'candidateName',
            'detectedEducation',
            'detectedProjects',
            'roleMatchPercentage',
            'sectionBreakdown',
            'resumeScore',
            'skillsFound',
            'missingSkills',
            'strengths',
            'areasToImprove',
            'suggestedSkills',
            'suggestedImprovements',
            'summary',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());

    if (parsed.isValidResume === false) {
      return {
        isValidResume: false,
        validationMessage:
          String(parsed.validationMessage || '').trim() ||
          `The uploaded file "${fileName}" is not a valid Resume/CV. Please upload a proper Resume containing your Education, Skills, and Projects.`,
        resumeScore: 0,
        skillsFound: [],
        missingSkills: [],
        strengths: [],
        areasToImprove: [],
        suggestedSkills: [],
        suggestedImprovements: [],
        summary: '',
      };
    }

    const clamp100 = (n: unknown, def = 65) =>
      Math.min(100, Math.max(0, Math.round(Number(n) ?? def)));

    return {
      isValidResume: true,
      candidateName: String(parsed.candidateName || 'Candidate').slice(0, 100),
      detectedEducation: String(parsed.detectedEducation || 'B.Tech / Engineering').slice(0, 200),
      detectedProjects: Array.isArray(parsed.detectedProjects)
        ? parsed.detectedProjects.slice(0, 6).map((s: unknown) => String(s).slice(0, 160))
        : [],
      roleMatchPercentage: clamp100(parsed.roleMatchPercentage, 65),
      sectionBreakdown: {
        technicalSkillsScore: clamp100(parsed.sectionBreakdown?.technicalSkillsScore, 65),
        projectsScore: clamp100(parsed.sectionBreakdown?.projectsScore, 65),
        educationScore: clamp100(parsed.sectionBreakdown?.educationScore, 75),
        structureAndAtsScore: clamp100(parsed.sectionBreakdown?.structureAndAtsScore, 70),
      },
      resumeScore: clamp100(parsed.resumeScore, 68),
      skillsFound: (parsed.skillsFound || []).slice(0, 30).map((s: unknown) => String(s).slice(0, 80)),
      missingSkills: (parsed.missingSkills || []).slice(0, 15).map((s: unknown) => String(s).slice(0, 80)),
      strengths: (parsed.strengths || []).slice(0, 10).map((s: unknown) => String(s).slice(0, 240)),
      areasToImprove: (parsed.areasToImprove || []).slice(0, 10).map((s: unknown) => String(s).slice(0, 240)),
      suggestedSkills: (parsed.suggestedSkills || []).slice(0, 12).map((s: unknown) => String(s).slice(0, 80)),
      suggestedImprovements: (parsed.suggestedImprovements || [])
        .slice(0, 10)
        .map((s: unknown) => String(s).slice(0, 240)),
      summary: String(parsed.summary || `Evaluated "${fileName}" against ${targetRole} requirements.`).slice(
        0,
        1500
      ),
    };
  } catch {
    return buildDeterministicResumeEvaluation({
      resumeText,
      targetRole,
      fileName,
      studentSkills: params.studentSkills,
    });
  }
}

const INTERVIEW_QUESTION_BANK: Record<
  string,
  Array<{ question: string; topic: string; hint: string; expectedKeywords: string[] }>
> = {
  Technical: [
    {
      question:
        'Explain the difference between a B+ Tree index and a Hash index in a relational database (DBMS). When would you choose one over the other?',
      topic: 'DBMS & Indexing',
      hint: 'Compare equality lookups O(1) vs range queries (<, >, BETWEEN), sorting, and disk I/O block reads.',
      expectedKeywords: ['range', 'equality', 'hash', 'tree', 'leaf', 'sorted', 'query', 'o(1)', 'o(log'],
    },
    {
      question:
        'How does runtime polymorphism work in Object-Oriented Programming, and how does it differ from compile-time method overloading?',
      topic: 'OOP Principles',
      hint: 'Explain method overriding, dynamic method dispatch (vtable), inheritance, and method signatures.',
      expectedKeywords: ['override', 'overriding', 'overload', 'dynamic', 'runtime', 'compile', 'inheritance', 'class', 'method'],
    },
    {
      question:
        'What are the four necessary conditions for a Deadlock in an Operating System, and what practical strategies are used to prevent or avoid it?',
      topic: 'Operating Systems',
      hint: 'Cover Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait, and resource ordering / Banker’s algorithm.',
      expectedKeywords: ['mutual exclusion', 'hold and wait', 'preemption', 'circular wait', 'resource', 'lock', 'banker'],
    },
    {
      question:
        'Compare an ArrayList (Dynamic Array) and a LinkedList in terms of memory layout, random access time complexity, and insertion/deletion overhead.',
      topic: 'Data Structures & Complexity',
      hint: 'Contrast contiguous memory and O(1) index access with pointer nodes and O(n) traversal.',
      expectedKeywords: ['contiguous', 'memory', 'o(1)', 'o(n)', 'pointer', 'node', 'index', 'cache', 'resize'],
    },
    {
      question:
        'Walk through what happens step-by-step at the network and application layers when you type a URL into a browser and press Enter.',
      topic: 'Computer Networks & Web',
      hint: 'Include DNS resolution, TCP 3-way handshake, TLS/HTTPS negotiation, HTTP request/response, and DOM rendering.',
      expectedKeywords: ['dns', 'ip', 'tcp', 'handshake', 'http', 'https', 'tls', 'server', 'browser', 'render'],
    },
  ],
  HR: [
    {
      question:
        'Tell me about a time during your B.Tech projects when your team faced a major technical roadblock or disagreement. How did you resolve it?',
      topic: 'Teamwork & Conflict Resolution (STAR)',
      hint: 'Use the STAR format: Situation, Task, Action you took, and the measurable Result.',
      expectedKeywords: ['team', 'project', 'problem', 'discussed', 'solution', 'result', 'learned', 'deadline'],
    },
    {
      question:
        'How do you prioritize your tasks when you have multiple project deadlines and placement exams happening in the same week?',
      topic: 'Time Management & Ownership',
      hint: 'Explain how you break down tasks by urgency/impact, set milestones, and communicate proactively.',
      expectedKeywords: ['prioritize', 'schedule', 'deadline', 'urgent', 'plan', 'focus', 'time', 'milestone'],
    },
    {
      question:
        'Why are you interested in this specific role, and what makes your academic projects a strong fit for our engineering team?',
      topic: 'Role Alignment & Motivation',
      hint: 'Connect your hands-on technical projects and problem-solving mindset directly to the target role.',
      expectedKeywords: ['role', 'project', 'skill', 'built', 'contribute', 'learn', 'team', 'experience'],
    },
  ],
};

export async function generateInterviewQuestionWithGemini(params: {
  role: string;
  type: 'Technical' | 'HR' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  experienceLevel: string;
  questionNumber: number;
  previousQuestions: string[];
}): Promise<{ question: string; topic: string; hint: string }> {
  const { role, type, difficulty, experienceLevel, questionNumber, previousQuestions } = params;

  try {
    const response = await generateContentWithModelFallback({
      contents: `Generate Question #${questionNumber} for a B.Tech placement mock interview.
Target Role: ${role}
Interview Type: ${type}
Difficulty: ${difficulty}
Candidate Experience Level: ${experienceLevel}
Previously Asked Questions (DO NOT repeat these): ${previousQuestions.join(' | ') || 'None'}

Return a single realistic, specific interview question, its topic label, and a brief 1-sentence hint on what a strong answer should cover.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            topic: { type: Type.STRING },
            hint: { type: Type.STRING },
          },
          required: ['question', 'topic', 'hint'],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    return {
      question: String(
        parsed.question ||
          `Explain a core technical design decision relevant to a ${role} role.`
      ),
      topic: String(parsed.topic || type),
      hint: String(
        parsed.hint || 'Structure your answer with the core concept, internal mechanism, and a concrete example.'
      ),
    };
  } catch {
    const pool =
      type === 'HR'
        ? INTERVIEW_QUESTION_BANK.HR
        : type === 'Mixed' && questionNumber % 2 === 0
        ? INTERVIEW_QUESTION_BANK.HR
        : INTERVIEW_QUESTION_BANK.Technical;
    const available = pool.filter((q) => !previousQuestions.includes(q.question));
    const chosen = available[0] || pool[(questionNumber - 1) % pool.length];
    return {
      question: chosen.question,
      topic: chosen.topic,
      hint: chosen.hint,
    };
  }
}

/**
 * Rigorous Linguistic & Technical Rubric Evaluator that inspects the student's actual answer
 * against the question asked, ensuring non-random, genuinely differentiated scores across
 * Technical Correctness, Relevance, Clarity, Communication, and Completeness.
 */
function analyzeAnswerDeterministically(params: {
  question: string;
  answer: string;
  role: string;
  type: 'Technical' | 'HR' | 'Mixed';
}): Omit<GeminiAnswerEvaluation, 'nextQuestion'> {
  const { question, answer, role, type } = params;
  const trimmed = answer.trim();
  const lowerAns = trimmed.toLowerCase();
  const lowerQ = question.toLowerCase();

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  // 1. Detect "I don't know", gibberish, or copying the question verbatim
  const isIDontKnow =
    /^(?:i\s*don'?t\s*know|idk|no\s*idea|not\s*sure|skip|pass|none|nothing|na|n\/a|\.+|-+)$/i.test(
      trimmed
    ) ||
    (wordCount <= 6 && /\b(?:don'?t\s*know|no\s*idea|not\s*sure|idk)\b/i.test(lowerAns));

  const uniqueChars = new Set(lowerAns.replace(/\s+/g, '')).size;
  const isGibberish =
    wordCount <= 2 ||
    uniqueChars <= 4 ||
    trimmed.toLowerCase() === lowerQ.trim();

  // Extract key domain terms from the question & general CS/HR vocabulary
  const stopWords = new Set([
    'what', 'when', 'where', 'which', 'would', 'could', 'should', 'explain', 'describe',
    'between', 'difference', 'how', 'does', 'work', 'with', 'from', 'that', 'this', 'your',
    'have', 'into', 'about', 'their', 'there', 'they', 'were', 'been', 'role', 'choose',
    'each', 'other', 'tell', 'time', 'during', 'used', 'using', 'make', 'makes',
  ]);

  const questionTerms = Array.from(
    new Set(
      lowerQ
        .replace(/[^a-z0-9+#]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !stopWords.has(w))
    )
  );

  // Check if question matches our known question bank for expected keywords
  const allBankQuestions = [...INTERVIEW_QUESTION_BANK.Technical, ...INTERVIEW_QUESTION_BANK.HR];
  const matchedBank = allBankQuestions.find((b) =>
    lowerQ.includes(b.topic.toLowerCase().split(' ')[0]) ||
    b.expectedKeywords.filter((kw) => lowerQ.includes(kw)).length >= 2
  );

  const targetKeywords = matchedBank
    ? matchedBank.expectedKeywords
    : questionTerms.length > 0
    ? questionTerms
    : ['concept', 'example', 'performance', 'implementation'];

  const conceptsCovered = targetKeywords.filter((kw) => lowerAns.includes(kw.toLowerCase()));
  const conceptsMissed = targetKeywords.filter((kw) => !lowerAns.includes(kw.toLowerCase()));

  if (isIDontKnow || isGibberish) {
    return {
      scoreOutOf10: 1,
      technicalCorrectness: 1,
      relevance: 1,
      clarity: 2,
      communication: 2,
      completeness: 1,
      wordCount,
      conceptsCovered: [],
      conceptsMissed: targetKeywords.slice(0, 5),
      clarityAndCommunicationNote:
        wordCount <= 3
          ? `Your response was only ${wordCount} word(s) ("${trimmed.slice(0, 40)}") and did not provide a structured explanation.`
          : 'Your response did not contain a substantive answer to the interviewer prompt.',
      feedback: `You answered "${trimmed.slice(0, 60)}", which does not address the interview question. In a placement interview, even if you are unsure of the exact syntax or formula, explain the foundational concept and how you would approach solving it.`,
      improvementSuggestion: `Start by defining the core terms in the question (${targetKeywords.slice(0, 3).join(', ')}), explain how they work step-by-step, and give 1 practical example.`,
      idealAnswerKeyPoints: [
        `Define the core mechanism behind ${questionTerms.slice(0, 3).join(', ') || 'the topic'}`,
        'Compare trade-offs (time/space complexity or practical constraints)',
        'Provide a concrete engineering example or project scenario',
      ],
      sampleIdealAnswer:
        'A strong 10/10 response defines the core concept clearly in the opening sentence, explains the underlying mechanism (such as time/space complexity or system workflow), and illustrates it with a real-world application.',
    };
  }

  // 2. Calculate independent, non-random scores for each of the 5 dimensions:

  // A. RELEVANCE (1-10): How directly does the answer address the prompt's terms?
  const questionOverlapRatio =
    questionTerms.length > 0
      ? questionTerms.filter((t) => lowerAns.includes(t)).length / questionTerms.length
      : 0.5;
  const keywordMatchRatio =
    targetKeywords.length > 0 ? conceptsCovered.length / targetKeywords.length : 0.5;
  const relevanceRaw =
    2 +
    questionOverlapRatio * 4.5 +
    keywordMatchRatio * 3.5 +
    (wordCount >= 15 ? 0.5 : -1);
  const relevance = Math.min(10, Math.max(1, Math.round(relevanceRaw)));

  // B. TECHNICAL CORRECTNESS (1-10): Domain vocabulary, mechanism explanation, complexity/trade-offs
  const technicalIndicators = [
    /\bo\([1nlog\s^+*]+\)/i,
    /\b(?:complexity|latency|throughput|memory|overhead|index|query|transaction|acid|deadlock|thread|process|polymorphism|encapsulation|inheritance|abstraction|interface|api|http|tcp|database|table|schema|cache|algorithm|array|tree|hash|graph|stack|queue)\b/i,
    /\b(?:because|since|therefore|causes|prevents|ensures|allows|reduces|optimizes)\b/i,
  ];
  const techSignalCount = technicalIndicators.filter((rx) => rx.test(trimmed)).length;
  const technicalRaw =
    1.5 +
    keywordMatchRatio * 5.0 +
    techSignalCount * 1.2 +
    (wordCount >= 35 ? 1.0 : wordCount < 12 ? -1.5 : 0);
  const technicalCorrectness = Math.min(10, Math.max(1, Math.round(technicalRaw)));

  // C. CLARITY (1-10): Sentence length balance, punctuation, readability, absence of repetition
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : wordCount;
  const uniqueWordRatio = new Set(words.map((w) => w.toLowerCase())).size / Math.max(1, wordCount);
  let clarityRaw = 5;
  if (wordCount < 10) {
    clarityRaw = 3;
  } else {
    // Good sentence length is 10-26 words per sentence
    if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 28) clarityRaw += 2.5;
    else if (avgWordsPerSentence > 40) clarityRaw -= 1.5; // Run-on sentence
    // Good lexical diversity (not repeating the same 3 words)
    if (uniqueWordRatio >= 0.55) clarityRaw += 1.5;
    else if (uniqueWordRatio < 0.4) clarityRaw -= 2;
    if (sentences.length >= 2) clarityRaw += 1;
  }
  const clarity = Math.min(10, Math.max(1, Math.round(clarityRaw)));

  // D. COMMUNICATION (1-10): Discourse connectors, structured framing, examples, professional tone
  const connectorMatches =
    trimmed.match(
      /\b(?:for example|for instance|specifically|firstly|secondly|finally|however|in contrast|whereas|on the other hand|therefore|consequently|as a result|in summary|furthermore|moreover|because)\b/gi
    ) || [];
  const hasExample = /\b(?:example|instance|e\.g\.|such as|scenario|project|when i|in my)\b/i.test(
    trimmed
  );
  let commRaw = 4;
  if (wordCount < 10) {
    commRaw = 3;
  } else {
    commRaw += Math.min(3, connectorMatches.length * 1.2);
    if (hasExample) commRaw += 1.5;
    if (sentences.length >= 3 && wordCount >= 30) commRaw += 1.5;
  }
  const communication = Math.min(10, Math.max(1, Math.round(commRaw)));

  // E. COMPLETENESS (1-10): Word depth + coverage of Definition + Mechanism + Example + Trade-offs
  let completenessRaw = 2;
  if (wordCount >= 60) completenessRaw += 3.5;
  else if (wordCount >= 35) completenessRaw += 2.5;
  else if (wordCount >= 18) completenessRaw += 1.5;
  completenessRaw += keywordMatchRatio * 3.0;
  if (hasExample) completenessRaw += 1.5;
  const completeness = Math.min(10, Math.max(1, Math.round(completenessRaw)));

  // Overall Score out of 10 (Weighted average of the 5 dimensions)
  const scoreOutOf10 = Math.min(
    10,
    Math.max(
      1,
      Math.round(
        technicalCorrectness * 0.35 +
          relevance * 0.2 +
          clarity * 0.15 +
          communication * 0.15 +
          completeness * 0.15
      )
    )
  );

  const clarityAndCommunicationNote = `Word Count: ${wordCount} words across ${sentences.length} sentence(s). ${
    connectorMatches.length > 0
      ? `Used structured transition phrases (${Array.from(new Set(connectorMatches.map((c) => c.toLowerCase()))).slice(0, 3).join(', ')}).`
      : 'Add transition connectors ("for example", "in contrast", "therefore") to improve communication flow.'
  } ${
    hasExample
      ? 'Included a practical example/scenario.'
      : 'Did not include a concrete real-world example.'
  }`;

  const feedback =
    scoreOutOf10 >= 8
      ? `Strong response (${wordCount} words). You accurately addressed key concepts (${conceptsCovered.slice(0, 4).join(', ') || 'core topic'}) with clear sentence structure.`
      : scoreOutOf10 >= 5
      ? `Moderate response (${wordCount} words). You touched upon ${conceptsCovered.length > 0 ? conceptsCovered.slice(0, 3).join(', ') : 'the general topic'}, but missed deeper discussion of ${conceptsMissed.slice(0, 3).join(', ') || 'edge cases and trade-offs'}.`
      : `Brief or incomplete response (${wordCount} words). Key concepts expected for this ${type} question (${conceptsMissed.slice(0, 4).join(', ')}) were missing or under-explained.`;

  const improvementSuggestion =
    conceptsMissed.length > 0
      ? `Explicitly cover [${conceptsMissed.slice(0, 4).join(', ')}] and include a concrete ${role} example to raise your Completeness (${completeness}/10) and Technical (${technicalCorrectness}/10) scores.`
      : 'Quantify performance trade-offs (Time/Space complexity or scalability impact) to make your answer stand out.';

  return {
    scoreOutOf10,
    technicalCorrectness,
    relevance,
    clarity,
    communication,
    completeness,
    wordCount,
    conceptsCovered: conceptsCovered.slice(0, 6),
    conceptsMissed: conceptsMissed.slice(0, 6),
    clarityAndCommunicationNote,
    feedback,
    improvementSuggestion,
    idealAnswerKeyPoints: [
      `Clear definition and core purpose of ${targetKeywords.slice(0, 2).join(' & ') || 'the concept'}`,
      `Internal mechanism / trade-offs (${targetKeywords.slice(2, 5).join(', ') || 'complexity & performance'})`,
      `Practical ${role} use case or real-world example`,
    ],
    sampleIdealAnswer: `An ideal response for ${role} starts by defining the concept clearly, explains how ${targetKeywords.slice(0, 3).join(', ')} interact under the hood, compares time/space or design trade-offs, and concludes with a brief practical example.`,
  };
}

export async function evaluateInterviewAnswerWithGemini(params: {
  role: string;
  type: 'Technical' | 'HR' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  experienceLevel: string;
  question: string;
  answer: string;
  isLastQuestion: boolean;
  nextQuestionNumber: number;
  previousQuestions: string[];
}): Promise<GeminiAnswerEvaluation> {
  const {
    role,
    type,
    difficulty,
    experienceLevel,
    question,
    answer,
    isLastQuestion,
    nextQuestionNumber,
    previousQuestions,
  } = params;

  // Always compute our deterministic linguistic & technical rubric first
  const localRubric = analyzeAnswerDeterministically({
    question,
    answer,
    role,
    type,
  });

  // If the answer is extremely short / "I don't know" / gibberish, return low scores immediately without wasting tokens or hallucinating
  if (localRubric.wordCount <= 4 || localRubric.scoreOutOf10 <= 2) {
    const nextGen = isLastQuestion
      ? { question: '', topic: '', hint: '' }
      : await generateInterviewQuestionWithGemini({
          role,
          type,
          difficulty,
          experienceLevel,
          questionNumber: nextQuestionNumber,
          previousQuestions,
        });

    return {
      ...localRubric,
      nextQuestion: nextGen.question,
      nextTopic: nextGen.topic,
      nextHint: nextGen.hint,
    };
  }

  try {
    const response = await generateContentWithModelFallback({
      contents: `You are a rigorous technical interviewer evaluating a B.Tech candidate's mock interview response.
Target Role: ${role}
Interview Type: ${type}
Difficulty: ${difficulty}
Experience Level: ${experienceLevel}

Question Asked: "${question}"
Candidate's Exact Answer (${localRubric.wordCount} words): "${answer}"

STRICT SCORING RULES (DO NOT GIVE RANDOM OR IDENTICAL SCORES):
Evaluate each dimension independently from 1 to 10 based strictly on the candidate's actual text:
1. technicalCorrectness (1-10): Accuracy of technical facts, terminology, and depth of mechanism explained. (If vague or wrong, score 1-4).
2. relevance (1-10): How directly the candidate answered the specific question asked.
3. clarity (1-10): Sentence structure, logical flow, and ease of understanding.
4. communication (1-10): Professional articulation, use of examples, transition phrases, and structured framing (e.g., STAR or Concept->Mechanism->Example).
5. completeness (1-10): Whether all parts of the question were answered thoroughly with examples and trade-offs. (Short 1-sentence answers must score <= 4 on completeness).
6. scoreOutOf10 (1-10): Weighted overall score for this answer.
7. conceptsCovered: Specific technical/behavioral concepts the candidate mentioned correctly.
8. conceptsMissed: Specific concepts or trade-offs the candidate failed to mention.
9. clarityAndCommunicationNote: 1-2 sentences specifically critiquing the candidate's sentence clarity, word count (${localRubric.wordCount} words), and communication structure.
10. feedback: 2-3 specific sentences referencing what the candidate actually wrote.
11. improvementSuggestion: 1-2 actionable sentences on how to improve this exact answer.
12. idealAnswerKeyPoints: 3 key bullet points expected in a 10/10 answer.
13. sampleIdealAnswer: A concise 3-4 sentence model answer for this question.
${
  !isLastQuestion
    ? `14. nextQuestion, nextTopic, nextHint: Generate Question #${nextQuestionNumber} for this ${role} (${type}, ${difficulty}) interview that has NOT been asked yet in [${previousQuestions.join(' | ')}].`
    : '14. nextQuestion, nextTopic, nextHint: Return empty strings "" since this was the final question.'
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoreOutOf10: { type: Type.INTEGER },
            technicalCorrectness: { type: Type.INTEGER },
            relevance: { type: Type.INTEGER },
            clarity: { type: Type.INTEGER },
            communication: { type: Type.INTEGER },
            completeness: { type: Type.INTEGER },
            conceptsCovered: { type: Type.ARRAY, items: { type: Type.STRING } },
            conceptsMissed: { type: Type.ARRAY, items: { type: Type.STRING } },
            clarityAndCommunicationNote: { type: Type.STRING },
            feedback: { type: Type.STRING },
            improvementSuggestion: { type: Type.STRING },
            idealAnswerKeyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            sampleIdealAnswer: { type: Type.STRING },
            nextQuestion: { type: Type.STRING },
            nextTopic: { type: Type.STRING },
            nextHint: { type: Type.STRING },
          },
          required: [
            'scoreOutOf10',
            'technicalCorrectness',
            'relevance',
            'clarity',
            'communication',
            'completeness',
            'conceptsCovered',
            'conceptsMissed',
            'clarityAndCommunicationNote',
            'feedback',
            'improvementSuggestion',
            'idealAnswerKeyPoints',
            'sampleIdealAnswer',
            'nextQuestion',
            'nextTopic',
            'nextHint',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    const clamp10 = (v: unknown, fallback: number) =>
      Math.min(10, Math.max(1, Math.round(Number(v) || fallback)));

    return {
      scoreOutOf10: clamp10(parsed.scoreOutOf10, localRubric.scoreOutOf10),
      technicalCorrectness: clamp10(parsed.technicalCorrectness, localRubric.technicalCorrectness),
      relevance: clamp10(parsed.relevance, localRubric.relevance),
      clarity: clamp10(parsed.clarity, localRubric.clarity),
      communication: clamp10(parsed.communication, localRubric.communication),
      completeness: clamp10(parsed.completeness, localRubric.completeness),
      wordCount: localRubric.wordCount,
      conceptsCovered:
        Array.isArray(parsed.conceptsCovered) && parsed.conceptsCovered.length > 0
          ? parsed.conceptsCovered.slice(0, 6).map(String)
          : localRubric.conceptsCovered,
      conceptsMissed:
        Array.isArray(parsed.conceptsMissed) && parsed.conceptsMissed.length > 0
          ? parsed.conceptsMissed.slice(0, 6).map(String)
          : localRubric.conceptsMissed,
      clarityAndCommunicationNote: String(
        parsed.clarityAndCommunicationNote || localRubric.clarityAndCommunicationNote
      ),
      feedback: String(parsed.feedback || localRubric.feedback),
      improvementSuggestion: String(
        parsed.improvementSuggestion || localRubric.improvementSuggestion
      ),
      idealAnswerKeyPoints:
        Array.isArray(parsed.idealAnswerKeyPoints) && parsed.idealAnswerKeyPoints.length > 0
          ? parsed.idealAnswerKeyPoints.slice(0, 4).map(String)
          : localRubric.idealAnswerKeyPoints,
      sampleIdealAnswer: String(parsed.sampleIdealAnswer || localRubric.sampleIdealAnswer),
      nextQuestion: isLastQuestion ? '' : String(parsed.nextQuestion || ''),
      nextTopic: isLastQuestion ? '' : String(parsed.nextTopic || type),
      nextHint: isLastQuestion ? '' : String(parsed.nextHint || ''),
    };
  } catch {
    const nextGen = isLastQuestion
      ? { question: '', topic: '', hint: '' }
      : await generateInterviewQuestionWithGemini({
          role,
          type,
          difficulty,
          experienceLevel,
          questionNumber: nextQuestionNumber,
          previousQuestions,
        });

    return {
      ...localRubric,
      nextQuestion: nextGen.question,
      nextTopic: nextGen.topic,
      nextHint: nextGen.hint,
    };
  }
}

export async function summarizeInterviewWithGemini(params: {
  role: string;
  type: string;
  difficulty: string;
  qaList: Array<{
    question: string;
    answer: string;
    scoreOutOf10: number;
    technicalCorrectness?: number;
    relevance?: number;
    clarity?: number;
    communication?: number;
    completeness?: number;
    feedback: string;
  }>;
}): Promise<GeminiInterviewCompletion> {
  const { role, type, difficulty, qaList } = params;
  const count = Math.max(1, qaList.length);

  const avg = (getter: (item: (typeof qaList)[number]) => number) =>
    Math.min(
      100,
      Math.max(
        0,
        Math.round((qaList.reduce((acc, item) => acc + getter(item), 0) / count) * 10)
      )
    );

  const dimensionAverages: InterviewDimensionAverages = {
    technicalAccuracy: avg((i) => Number(i.technicalCorrectness ?? i.scoreOutOf10) || 0),
    relevance: avg((i) => Number(i.relevance ?? i.scoreOutOf10) || 0),
    clarity: avg((i) => Number(i.clarity ?? i.scoreOutOf10) || 0),
    communication: avg((i) => Number(i.communication ?? i.scoreOutOf10) || 0),
    completeness: avg((i) => Number(i.completeness ?? i.scoreOutOf10) || 0),
  };

  const computedOverallScore = Math.round(
    dimensionAverages.technicalAccuracy * 0.35 +
      dimensionAverages.relevance * 0.2 +
      dimensionAverages.clarity * 0.15 +
      dimensionAverages.communication * 0.15 +
      dimensionAverages.completeness * 0.15
  );

  const performanceBand =
    computedOverallScore >= 80
      ? 'Excellent (Placement Ready)'
      : computedOverallScore >= 65
      ? 'Good (Solid Foundation)'
      : computedOverallScore >= 45
      ? 'Developing (Needs Practice)'
      : 'Needs Foundation & Practice';

  // Determine strongest and weakest dimensions deterministically from actual scores
  const dimEntries: Array<{ name: string; score: number }> = [
    { name: 'Technical Accuracy', score: dimensionAverages.technicalAccuracy },
    { name: 'Question Relevance', score: dimensionAverages.relevance },
    { name: 'Answer Clarity', score: dimensionAverages.clarity },
    { name: 'Communication & Framing', score: dimensionAverages.communication },
    { name: 'Depth & Completeness', score: dimensionAverages.completeness },
  ].sort((a, b) => b.score - a.score);

  try {
    const transcriptText = qaList
      .map(
        (item, idx) =>
          `Q${idx + 1}: ${item.question}\nAnswer: ${item.answer}\nScores (out of 10): Overall=${item.scoreOutOf10}, Tech=${item.technicalCorrectness}, Relevance=${item.relevance}, Clarity=${item.clarity}, Comm=${item.communication}, Completeness=${item.completeness}\nFeedback: ${item.feedback}`
      )
      .join('\n\n');

    const response = await generateContentWithModelFallback({
      contents: `Summarize this completed B.Tech placement mock interview for "${role}" (${type}, ${difficulty}).
Calculated Overall Score: ${computedOverallScore}/100 (${performanceBand})
Dimension Averages: Technical=${dimensionAverages.technicalAccuracy}%, Relevance=${dimensionAverages.relevance}%, Clarity=${dimensionAverages.clarity}%, Communication=${dimensionAverages.communication}%, Completeness=${dimensionAverages.completeness}%

Transcript:
${transcriptText}

Provide:
- strongAreas: 2-4 specific strengths demonstrated in the candidate's actual answers (or note if answers were too brief)
- weakAreas: 2-4 specific weaknesses or missed technical concepts from the transcript
- suggestions: 3-4 actionable steps to improve Technical Accuracy, Clarity, and Communication`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strongAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['strongAreas', 'weakAreas', 'suggestions'],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    return {
      overallScore: computedOverallScore,
      performanceBand,
      dimensionAverages,
      strongAreas: (parsed.strongAreas || [
        `Strongest dimension: ${dimEntries[0].name} (${dimEntries[0].score}%)`,
      ])
        .slice(0, 5)
        .map((s: unknown) => String(s).slice(0, 220)),
      weakAreas: (parsed.weakAreas || [
        `Lowest dimension: ${dimEntries[dimEntries.length - 1].name} (${dimEntries[dimEntries.length - 1].score}%)`,
      ])
        .slice(0, 5)
        .map((s: unknown) => String(s).slice(0, 220)),
      suggestions: (parsed.suggestions || [
        'Structure technical answers with Concept -> Mechanism -> Example -> Trade-offs',
      ])
        .slice(0, 5)
        .map((s: unknown) => String(s).slice(0, 240)),
    };
  } catch {
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];

    for (const d of dimEntries) {
      if (d.score >= 65) {
        strongAreas.push(`${d.name}: Scored ${d.score}% across ${count} question(s)`);
      } else {
        weakAreas.push(`${d.name}: Scored ${d.score}% — requires deeper explanation and examples`);
      }
    }

    if (strongAreas.length === 0) {
      strongAreas.push(
        `Relative best area: ${dimEntries[0].name} (${dimEntries[0].score}%), though overall answers need more depth`
      );
    }
    if (weakAreas.length === 0) {
      weakAreas.push(
        `Focus on pushing ${dimEntries[dimEntries.length - 1].name} (${dimEntries[dimEntries.length - 1].score}%) closer to 90%+`
      );
    }

    return {
      overallScore: computedOverallScore,
      performanceBand,
      dimensionAverages,
      strongAreas: strongAreas.slice(0, 4),
      weakAreas: weakAreas.slice(0, 4),
      suggestions: [
        `To improve Technical Accuracy (${dimensionAverages.technicalAccuracy}%), explicitly state time/space complexity and internal working mechanisms.`,
        `To improve Clarity (${dimensionAverages.clarity}%) & Communication (${dimensionAverages.communication}%), use 3-5 well-structured sentences with transition words ("for example", "therefore", "in contrast").`,
        `To improve Completeness (${dimensionAverages.completeness}%), always conclude your answer with a real-world ${role} use case or edge case.`,
      ],
    };
  }
}
