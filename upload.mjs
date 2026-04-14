import fs from 'fs';
import FormData from 'form-data';
import https from 'https';

async function upload() {
  https.get('https://api.gofile.io/servers', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const server = JSON.parse(data).data.servers[0].name;
      
      const form = new FormData();
      form.append('file', fs.createReadStream('app-build.zip'));

      const options = {
        hostname: `${server}.gofile.io`,
        port: 443,
        path: '/contents/uploadfile',
        method: 'POST',
        headers: form.getHeaders()
      };

      const req = https.request(options, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          console.log("RESPONSE=" + data2);
        });
      });

      form.pipe(req);
    });
  });
}

upload();
