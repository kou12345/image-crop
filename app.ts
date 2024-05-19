import sharp = require("sharp");
import fs = require("fs");

const path = "/Users/kou12345/Downloads/heic1901a (1).tif";

const targetSize = 4 * 1024 * 1024; // 4MB
const outputPrefix = "output/output";

const splitImageRecursive = async (
  inputPath: string,
  outputPath: string,
  top: number,
  height: number
) => {
  const halfHeight = Math.ceil(height / 2);

  // 上半分の画像を抽出して保存
  const topOutputPath = `${outputPath}_top.jpg`;
  await sharp(inputPath)
    .extract({
      left: 0,
      top,
      width: (await sharp(inputPath).metadata()).width!,
      height: halfHeight,
    })
    .toFile(topOutputPath);

  // 上半分の画像のファイルサイズを確認
  const topFileSize = fs.statSync(topOutputPath).size;
  if (topFileSize > targetSize) {
    // 上半分の画像が4MBを超える場合、再度二等分
    await splitImageRecursive(inputPath, `${outputPath}_top`, top, halfHeight);
    fs.unlinkSync(topOutputPath); // 中間ファイルを削除
  }

  // 下半分の画像を抽出して保存
  const bottomOutputPath = `${outputPath}_bottom.jpg`;
  await sharp(inputPath)
    .extract({
      left: 0,
      top: top + halfHeight,
      width: (await sharp(inputPath).metadata()).width!,
      height: height - halfHeight,
    })
    .toFile(bottomOutputPath);

  // 下半分の画像のファイルサイズを確認
  const bottomFileSize = fs.statSync(bottomOutputPath).size;
  if (bottomFileSize > targetSize) {
    // 下半分の画像が4MBを超える場合、再度二等分
    await splitImageRecursive(
      inputPath,
      `${outputPath}_bottom`,
      top + halfHeight,
      height - halfHeight
    );
    fs.unlinkSync(bottomOutputPath); // 中間ファイルを削除
  }
};

const splitImage = async () => {
  const metadata = await sharp(path).metadata();
  await splitImageRecursive(path, outputPrefix, 0, metadata.height!);
  console.log("Image split completed.");
};

splitImage().catch(console.error);
