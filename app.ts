import sharp = require("sharp");

const path = "/Users/koichiro-hira/Desktop/シマダヤ0503既存文字-4c.jpg";

const outputSizes = [
  // { width: 1092, height: 1092, aspect: "1:1" },
  // { width: 951, height: 1268, aspect: "3:4" },
  // { width: 896, height: 1344, aspect: "2:3" },
  // { width: 819, height: 1456, aspect: "9:16" },
  { width: 784, height: 1568, aspect: "1:2" },
];

const overlapPixels = 100; // 重複させるピクセル数

const splitImage = async () => {
  const metadata = await sharp(path).metadata();
  const aspectRatio = metadata.width! / metadata.height!;

  for (const size of outputSizes) {
    if (metadata.width! <= size.width && metadata.height! <= size.height) {
      console.log(
        `Image dimensions (${metadata.width}x${metadata.height}) are within the specified size (${size.width}x${size.height}). Skipping split.`
      );
      continue;
    }

    const outputAspectRatio = size.width / size.height;
    let outputWidth, outputHeight;

    if (aspectRatio > outputAspectRatio) {
      outputWidth = size.width;
      outputHeight = Math.round(size.width / aspectRatio);
    } else {
      outputWidth = Math.round(size.height * aspectRatio);
      outputHeight = size.height;
    }

    const numColumns = Math.ceil(
      (metadata.width! - overlapPixels) / (outputWidth - overlapPixels)
    );
    const numRows = Math.ceil(
      (metadata.height! - overlapPixels) / (outputHeight - overlapPixels)
    );

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const left = col * (outputWidth - overlapPixels);
        const top = row * (outputHeight - overlapPixels);
        const width = Math.min(outputWidth, metadata.width! - left);
        const height = Math.min(outputHeight, metadata.height! - top);

        const outputPath = `output_${size.aspect}_${row}_${col}.jpg`;
        await sharp(path)
          .extract({ left, top, width, height })
          .toFile(outputPath);

        console.log(`Image split and saved as ${outputPath}`);
      }
    }
  }
};

splitImage().catch(console.error);
