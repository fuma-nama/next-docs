/* eslint-disable import/no-relative-packages -- required */
import {
  LayoutIcon,
  LibraryIcon,
  PaperclipIcon,
  type LucideIcon,
} from 'lucide-react';
import mdx from '../../../packages/mdx/package.json';
import ui from '../../../packages/ui/package.json';
import zeta from '../../../packages/headless/package.json';

export interface Mode {
  param: string;
  name: string;
  description: string;
  version: string;
  icon: LucideIcon;
}

export const modes: Mode[] = [
  {
    param: 'headless',
    name: 'Next Docs Zeta',
    description: 'The headless library',
    version: zeta.version,
    icon: LibraryIcon,
  },
  {
    param: 'ui',
    name: 'Next Docs UI',
    description: 'The framework',
    version: ui.version,
    icon: LayoutIcon,
  },
  {
    param: 'mdx',
    name: 'Next Docs MDX',
    description: 'Better Next.js MDX',
    version: mdx.version,
    icon: PaperclipIcon,
  },
];
