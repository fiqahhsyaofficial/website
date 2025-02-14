import path from 'path';
import fs from 'fs';
import { visit } from 'unist-util-visit';
import { UnistNode, UnistTree } from './unist';
import { SUPPORTED_CSS_LIBS } from './constants';
import { mdxElement } from './unist-mdx-element';

const rehypeHeroCodeBlock = () => (tree: UnistTree) => {
  visit(tree, (node: UnistNode) => {
    if (node.name === 'HeroCodeBlock') {
      const folder = getAttribute(node, 'folder');

      if (typeof folder === 'string') {
        node.children = [];

        SUPPORTED_CSS_LIBS.forEach((lib) => {
          ['index.jsx', 'styles.css', 'styles.module.css', 'tailwind.config.js'].forEach((file) => {
            const filePath = `${process.cwd()}/components/demos/${folder}/${lib}/${file}`;
            if (fileExists(filePath)) {
              const extension = file.split('.').pop()!;
              const syntax = getSyntax(extension);
              let source = fs.readFileSync(path.join(filePath), 'utf8');
              node.children!.push(
                mdxElement({
                  name: 'pre',
                  props: {
                    cssLib: lib,
                    title: file,
                    file: filePath,
                    syntax,
                    source,
                  },
                  children: [
                    mdxElement({
                      name: 'code',
                      props: {
                        // Recreate the language class for syntax highlighting
                        className: [`language-${syntax}`],
                      },
                      children: [
                        {
                          type: 'text',
                          value: source,
                        },
                      ],
                    }),
                  ],
                })
              );
            }
          });
        });
      }
    }
  });
};

function getAttribute(node: UnistNode, name: string) {
  return node.attributes?.find((attribute) => attribute.name === name)?.value;
}

function fileExists(path: string) {
  try {
    fs.accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
}

function getSyntax(extension: string) {
  return extension;
}

export default rehypeHeroCodeBlock;
