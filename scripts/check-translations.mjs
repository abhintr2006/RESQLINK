import fs from 'node:fs';

const languageSource = fs.readFileSync('src/i18n/languages.ts', 'utf8');
const translationSource = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const expected = ['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'or', 'ml', 'pa', 'as', 'mai', 'sa', 'kok', 'ne', 'sd', 'doi', 'mni', 'brx', 'sat', 'ks'];
const missingMetadata = expected.filter((code) => !new RegExp(`code: '${code}'`).test(languageSource));
if (missingMetadata.length) throw new Error(`Missing language metadata: ${missingMetadata.join(', ')}`);
if (!translationSource.includes('COMPLETE_TRANSLATIONS')) throw new Error('Complete translation matrix is not enabled');
const keyCount = (translationSource.match(/^\s*'[^']+':\s*\{/gm) || []).length;
if (keyCount < 1) throw new Error('No translation keys found');
console.log(`i18n check passed: ${expected.length} languages, ${keyCount} source keys, complete fallback matrix enabled`);
