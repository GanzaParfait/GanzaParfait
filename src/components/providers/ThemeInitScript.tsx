"use client";

import { useServerInsertedHTML } from "next/navigation";

const THEME_INIT = `(function(){try{var d=localStorage.getItem('theme')==='dark';var c='#ffffff';document.documentElement.setAttribute('data-theme',d?'dark':'light');document.documentElement.style.colorScheme=d?'dark':'light';var m=document.querySelectorAll('meta[name="theme-color"]');if(!m.length){var n=document.createElement('meta');n.setAttribute('name','theme-color');n.setAttribute('content',c);document.head.appendChild(n);}else{m.forEach(function(el){el.setAttribute('content',c);});}}catch(e){}})();`;

/**
 * Injects the theme FOUC script outside the React client tree so React 19
 * does not warn about executing <script> tags rendered by components.
 */
export default function ThemeInitScript() {
  useServerInsertedHTML(() => (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
    />
  ));
  return null;
}
