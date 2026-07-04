const NAMES = ["John Doe", "Jane Smith", "Alex Rivera", "Emily Chen", "Michael Scott", "Sarah Connor", "Bruce Wayne", "Clark Kent", "Diana Prince", "Peter Parker", "Tony Stark", "Selina Kyle", "Arthur Dent", "Trillian Astra", "Ford Prefect", "Zaphod Beeblebrox"];
const CITIES = ["New York", "San Francisco", "London", "Tokyo", "Paris", "Berlin", "Sydney", "Toronto", "Singapore", "Mumbai", "Cape Town", "Sao Paulo"];
const COUNTRIES = ["United States", "Canada", "United Kingdom", "Germany", "France", "Japan", "Australia", "Singapore", "Brazil", "India", "South Africa"];
const COMPANIES = ["Acme Corp", "Globex Corporation", "Initech", "Umbrella Corp", "Cyberdyne Systems", "Veerdyne", "Hooli", "Soylent Corp", "Dunder Mifflin", "Stark Industries", "Wayne Enterprises"];
const LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function interpolateString(str, index = 1, context = {}) {
  if (typeof str !== 'string') return str;
  
  return str.replace(/\{\{([\w\.]+)\}\}/g, (match, token) => {
    const parts = token.split('.');
    if (parts.length > 1) {
      const [scope, key] = parts;
      const target = context[scope.toLowerCase()];
      if (target && target[key] !== undefined) {
        return target[key].toString();
      }
      return match;
    }

    switch (token.toLowerCase()) {
      case 'id':
        return generateUUID();
      case 'index':
        return index.toString();
      case 'name':
        return getRandomElement(NAMES);
      case 'email': {
        const name = getRandomElement(NAMES).toLowerCase().replace(/\s+/g, '.');
        return `${name}@example.com`;
      }
      case 'phone':
        return `+1 (555) 01${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
      case 'city':
        return getRandomElement(CITIES);
      case 'country':
        return getRandomElement(COUNTRIES);
      case 'company':
        return getRandomElement(COMPANIES);
      case 'date': {
        const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        return date.toISOString();
      }
      case 'boolean':
        return (Math.random() > 0.5).toString();
      case 'number':
        return (Math.floor(Math.random() * 100) + 1).toString();
      case 'price':
        return (Math.random() * 100 + 5).toFixed(2);
      case 'avatar':
        return `https://i.pravatar.cc/150?u=${Math.floor(Math.random() * 1000)}`;
      case 'paragraph':
        return LOREM.join(' ');
      case 'sentence':
        return getRandomElement(LOREM);
      case 'word':
        return getRandomElement(LOREM).split(' ')[0].replace(/[^a-zA-Z]/g, '');
      default:
        return match;
    }
  });
}

function castType(val) {
  if (typeof val !== 'string') return val;
  if (val === 'true') return true;
  if (val === 'false') return false;
  
  if (/^\-?\d+(\.\d+)?$/.test(val) && val.length < 10) {
    const num = Number(val);
    if (!isNaN(num)) return num;
  }
  return val;
}

export function parseMockTemplate(templateObj, index = 1, context = {}) {
  if (templateObj === null) return null;
  
  if (Array.isArray(templateObj)) {
    return templateObj.map((item, idx) => parseMockTemplate(item, idx + 1, context));
  }
  
  if (typeof templateObj === 'object') {
    const result = {};
    for (const key in templateObj) {
      if (Object.prototype.hasOwnProperty.call(templateObj, key)) {
        const val = templateObj[key];
        const match = key.match(/^(.+)\|(\d+)(?:-(\d+))?$/);
        if (match) {
          const baseKey = match[1];
          const min = parseInt(match[2], 10);
          const max = match[3] ? parseInt(match[3], 10) : min;
          const count = min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;
          
          result[baseKey] = Array.from({ length: count }, (_, idx) => parseMockTemplate(val, idx + 1, context));
        } else {
          result[key] = parseMockTemplate(val, index, context);
        }
      }
    }
    return result;
  }
  
  if (typeof templateObj === 'string') {
    const exactTokenMatch = templateObj.match(/^\{\{([\w\.]+)\}\}$/);
    if (exactTokenMatch) {
      const interpolated = interpolateString(templateObj, index, context);
      return castType(interpolated);
    }
    return interpolateString(templateObj, index, context);
  }
  
  return templateObj;
}
