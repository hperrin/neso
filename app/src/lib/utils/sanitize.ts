import sanitizeHtml from 'sanitize-html';

let sanitizeOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
  allowedAttributes: {
    '*': ['dir', 'align', 'alt', 'center', 'bgcolor'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'height', 'width'],
    tr: ['rowspan'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    table: ['cellspacing'],
  },
  allowedSchemes: ['mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['data'],
    a: ['http', 'https', 'mailto', 'tel'],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName: string, attribs: { [k: string]: string }) => {
      if ('class' in attribs && attribs.class.match(/\bmention\b/)) {
        attribs.href = `/social/search/${encodeURIComponent(attribs.href)}`;
      } else {
        attribs.target = '_blank';
        attribs.rel = 'noopener noreferrer';
      }
      return {
        tagName,
        attribs,
      };
    },
  },
};

export function sanitize(html: string) {
  return sanitizeHtml(html.trim(), sanitizeOptions);
}
