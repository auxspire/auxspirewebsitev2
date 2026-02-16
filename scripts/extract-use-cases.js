/**
 * Extract use case summaries from .docx files and merge into case-studies/data.json
 * Run: node scripts/extract-use-cases.js
 * Source: D:\Work\Auxspire Website\auxspire.com\stories (or USE_CASES_SOURCE env)
 */
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const SOURCE = process.env.USE_CASES_SOURCE || 'D:\\Work\\Auxspire Website\\auxspire.com\\stories';
const DATA_PATH = path.join(__dirname, '..', 'case-studies', 'data.json');
const MAX_SUMMARY_LENGTH = 2000;

const DOC_TO_ID = {
  'Use Case_EDUCATIONAL INSTITUTION.docx': 5,
  'Use Cases ACERS and MARAD.docx': 1,
  'Use Cases for Casper ChatBot.docx': 2,
  'USE CASES FOR CASPER OMS PROJECT.docx': 3,
  'Use Cases Product Data Upload.docx': 4,
  'UseCases_Consumer Goods Cloud project.docx': 8,
  'UseCases_GeoTechniqueSalesforce.docx': 9,
  'UseCases_US Postal Services.docx': 10,
  'UseCasesImmerseEducation.docx': 6,
  'UseCaseSPECIALIST ENGINEERING.docx': 7,
};

async function extractText(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  let text = (result.value || '').trim();
  if (text.length > MAX_SUMMARY_LENGTH) {
    text = text.substring(0, MAX_SUMMARY_LENGTH) + '...';
  }
  return text;
}

async function main() {
  const dataPath = path.resolve(DATA_PATH);
  let studies = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  for (const [docName, caseId] of Object.entries(DOC_TO_ID)) {
    const docPath = path.join(SOURCE, docName);
    if (!fs.existsSync(docPath)) {
      console.warn('Skipping (not found):', docPath);
      continue;
    }
    try {
      const text = await extractText(docPath);
      const study = studies.find(s => s.id === caseId);
      if (study && text) {
        study.useCaseSummary = text;
        console.log('Merged use case for id', caseId);
      }
    } catch (err) {
      console.error('Error processing', docName, err.message);
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(studies, null, 2));
  console.log('Updated', dataPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
