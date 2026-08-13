/*
  Node-friendly usage of ffmpeg.wasm UMD build.
  Uses the exported FFmpeg class, reads the input file with fs,
  writes into the in-memory FS, runs the transcode, and writes output.
*/
(async () => {
  try {
    const ffmpegModule = require('@ffmpeg/ffmpeg/dist/umd/ffmpeg.js');
    const FFmpeg = ffmpegModule.FFmpeg || ffmpegModule.FFmpegWASM?.FFmpeg || ffmpegModule.FFmpeg;
    if (!FFmpeg) throw new Error('Unable to find FFmpeg export in module');
    const ffmpeg = new FFmpeg({ log: true });
    console.log('Loading ffmpeg.wasm (this may download worker/core files)...');
    await ffmpeg.load();

    const fs = require('fs');
    const inName = 'Howrahbridgeassembling.mp4';
    const outName = 'Howrahbridgeassembling_scrub.mp4';
    console.log('Reading input file from disk:', inName);
    const buffer = fs.readFileSync(inName);
    ffmpeg.FS('writeFile', inName, new Uint8Array(buffer));

    console.log('Running transcoding (every frame as keyframe)... This may take a while.');
    await ffmpeg.run('-i', inName, '-g', '1', '-keyint_min', '1', '-an', outName);

    console.log('Transcode finished; writing output to disk...');
    const data = ffmpeg.FS('readFile', outName);
    fs.writeFileSync(outName, Buffer.from(data));
    console.log('WASM ffmpeg finished, wrote', outName);
  } catch (err) {
    console.error('Error during wasm ffmpeg run:', err);
    process.exit(1);
  }
})();
