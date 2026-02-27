const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
  try {
    // Находим главный входной файл (например, index.ts или main.ts)
    const entryPoint = findMainEntryFile('./src');

    if (!entryPoint) {
      throw new Error('Не найден главный файл! Убедитесь, что есть index.ts или main.ts');
    }

    console.log(`📦 Используем точку входа: ${entryPoint}`);

    await esbuild.build({
      entryPoints: [entryPoint], // Используем один главный файл
      bundle: true,
      outfile: 'dist/eyedropper-polyfill.js',
      format: 'esm',
      platform: 'browser',
      target: ['es6'],
      minify: false,
      sourcemap: true,
      globalName: 'EyeDropperPolyfill',
      // Важно: включаем автоматическое разрешение всех импортов
      resolveExtensions: ['.ts', '.js', '.mjs', '.cjs'],
      // Опции для обработки TypeScript
      loader: {
        '.ts': 'ts',
      },
    });

    console.log('✅ Сборка завершена! Бандл сохранен в dist/eyedropper-polyfill.js');

    // Проверяем размер файла
    const stats = fs.statSync('dist/eyedropper-polyfill.js');
    console.log(`📊 Размер бандла: ${(stats.size / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Ошибка сборки:', error);
    process.exit(1);
  }
}

// Функция для поиска главного входного файла
function findMainEntryFile(srcDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`⚠️ Папка ${srcDir} не найдена, ищем в корне...`);
    srcDir = '.';
  }

  const possibleEntries = [
    path.join(srcDir, 'index.ts'),
    path.join(srcDir, 'main.ts'),
    path.join(srcDir, 'app.ts'),
    path.join(srcDir, 'bundle.ts'),
    path.join(srcDir, 'script.ts'),
  ];

  for (const entry of possibleEntries) {
    if (fs.existsSync(entry)) {
      return entry;
    }
  }

  // Если не нашли по стандартным именам, берем первый .ts файл
  const tsFiles = findTsFiles(srcDir);
  if (tsFiles.length > 0) {
    console.log(`📝 Используем первый найденный TS файл: ${tsFiles[0]}`);
    return tsFiles[0];
  }

  return null;
}

// Функция для поиска всех .ts файлов
function findTsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

build();
