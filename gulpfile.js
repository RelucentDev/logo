/**
 * Relucent Logo.
 *
 * @since     1.0.0
 * @copyright 2023 Relucent Ltd
 * @author    Relucent Ltd <hello@relucent.dev>
 * @see       https://relucent.dev
 */

const { src, dest } = require("gulp");
const sharp = require("sharp");
const through2 = require("through2");

const outputs = [
  {
    format: "png",
    fileName: (fileName) => `${fileName}.png`,
    options: {},
  },
  /*
  {
    format: "gif",
    fileName: (fileName) => `${fileName}.gif`,
    options: {},
  },
  */
  {
    format: "webp",
    fileName: (fileName) => `${fileName}.webp`,
    options: {},
  },
  // No JPEG due to lack of transparency
];

async function images() {
  const del = await import("del");
  const zip = await import("gulp-zip");
  const tar = await import("gulp-tar");

  await del.deleteAsync(["dist/"]);

  const compiled = src("src/*.svg")
    .pipe(
      through2.obj(async function (file, _, cb) {
        const compiledFilename = file.basename.replace(".svg", "");

        for await (const output of outputs) {
          const buffer = await sharp(file.contents)
            .toFormat(output.format, output.options)
            .toBuffer();

          const compiledFile = file.clone();
          compiledFile.basename = output.fileName(compiledFilename);
          compiledFile.contents = buffer;

          this.push(compiledFile);
        }

        cb(null, file);
      }),
    )
    .pipe(dest("dist"));

  compiled.pipe(zip.default("relucent-logo.zip")).pipe(dest("out"));
  compiled.pipe(tar.default("relucent-logo.tar")).pipe(dest("out"));
}

exports.default = images;
