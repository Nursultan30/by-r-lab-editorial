import {cp,rm,mkdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=new URL('.',import.meta.url);
const html=await readFile(new URL('src/index.html',root),'utf8');
if(!html.includes('996551005454'))throw new Error('Confirmed WhatsApp number missing');
await rm(new URL('dist',root),{recursive:true,force:true});
await mkdir(new URL('dist',root),{recursive:true});
await cp(new URL('src',root),new URL('dist',root),{recursive:true});
console.log('Static build complete: dist/');
