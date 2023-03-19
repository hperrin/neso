export default function parseApp(curPage: URL) {
  return curPage.pathname?.match(/^\/(\w+)\/?/)?.[1] || 'none';
}
