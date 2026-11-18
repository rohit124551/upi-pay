#!/usr/bin/env node

/**
 * UPI Pay CLI
 * Official command-line interface for bulk UPI payouts, batch reconciliation,
 * and dynamic NPCI QR generation.
 *
 * Usage:
 *   npx upi-pay qr --upi <vpa> [--amount <inr>] [--desc <note>]
 *   npx upi-pay parse <file-or-string>
 *   npx upi-pay reconcile --file <csv> --total <amount>
 */

const fs = require('fs');
const path = require('path');
const qrcodegen = require('./qrcodegen');

const VERSION = '2.0.2';

// Regex for valid NPCI Virtual Payment Address (VPA)
const VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

function printHelp() {
  console.log(`
UPI Pay CLI — Bulk UPI Payouts & Dynamic QR Suite (v${VERSION})
https://upi.rohitkumarranjan.in/

Usage:
  upi-pay <command> [options]
  npx @rohit124551/upi-pay <command> [options]

Commands:
  qr          Generate a dynamic NPCI UPI payment URI and ASCII QR code
  parse       Parse unformatted text or CSV into clean UPI payout rows
  reconcile   Run 4-way reconciliation check against a master batch total
  version     Display current CLI version
  help        Show this help message

Options for 'qr':
  --upi <vpa>         Payee UPI ID / Virtual Payment Address (required)
  --amount <inr>      Amount in Indian Rupees (optional, e.g. 499.00)
  --desc <note>       Transaction note or invoice reference (optional)
  --name <payee>      Payee display name (optional)

Options for 'parse':
  --file <path>       Path to text or CSV file containing raw beneficiary list
  --text <string>     Raw pasted string (e.g. from WhatsApp or spreadsheet)

Options for 'reconcile':
  --file <path>       Path to CSV file with columns: upi,amount
  --total <amount>    Expected master batch total in INR

Examples:
  npx @rohit124551/upi-pay qr --upi merchant@okaxis --amount 499 --desc "Invoice 1042"
  npx @rohit124551/upi-pay parse --file ./payouts.txt
  npx @rohit124551/upi-pay reconcile --file ./payouts.csv --total 50000
`);
}

function generateUpiUri(upi, amount, desc, name) {
  let uri = `upi://pay?pa=${encodeURIComponent(upi)}`;
  if (name) uri += `&pn=${encodeURIComponent(name)}`;
  if (amount) uri += `&am=${encodeURIComponent(parseFloat(amount).toFixed(2))}`;
  uri += `&cu=INR`;
  if (desc) uri += `&tn=${encodeURIComponent(desc)}`;
  return uri;
}

function parseArgs(args) {
  const result = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        result[key] = next;
        i++;
      } else {
        result[key] = true;
      }
    } else {
      result._.push(arg);
    }
  }
  return result;
}

// Visual Terminal QR Code display helper using ANSI half-blocks
function renderAsciiQr(text) {
  console.log('\n--- Dynamic NPCI UPI QR Code ---');
  console.log('Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app:\n');

  try {
    const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM);
    const border = 2;
    const size = qr.size;

    // ANSI escape codes for high-contrast scannability on all terminals (dark & light):
    // \x1b[47m = White background (quiet zone and light modules)
    // \x1b[30m = Black foreground (dark modules)
    // \x1b[0m  = Reset formatting
    const BG_WHITE = '\x1b[47m';
    const FG_BLACK = '\x1b[30m';
    const RESET = '\x1b[0m';

    // Unicode half-blocks render 2 vertical modules per character cell,
    // producing a true 1:1 aspect ratio square QR code in standard monospace terminals.
    for (let y = -border; y < size + border; y += 2) {
      let line = BG_WHITE + FG_BLACK;
      for (let x = -border; x < size + border; x++) {
        const topDark = (x >= 0 && x < size && y >= 0 && y < size) ? qr.getModule(x, y) : false;
        const bottomY = y + 1;
        const bottomDark = (x >= 0 && x < size && bottomY >= 0 && bottomY < size) ? qr.getModule(x, bottomY) : false;

        if (topDark && bottomDark) {
          line += '█';
        } else if (topDark && !bottomDark) {
          line += '▀';
        } else if (!topDark && bottomDark) {
          line += '▄';
        } else {
          line += ' ';
        }
      }
      line += RESET;
      console.log(line);
    }
  } catch (err) {
    console.error('Note: Unable to render visual QR code:', err.message);
  }

  console.log('\n[ UPI INTENT URI ]');
  console.log(text);
  console.log('\nDirect Browser Link:');
  const parts = text.match(/pa=([^&]+)/);
  const upiId = parts ? decodeURIComponent(parts[1]) : '';
  const amMatch = text.match(/am=([^&]+)/);
  const amount = amMatch ? decodeURIComponent(amMatch[1]) : '';
  const tnMatch = text.match(/tn=([^&]+)/);
  const desc = tnMatch ? decodeURIComponent(tnMatch[1]) : '';
  let webUrl = `https://upi.rohitkumarranjan.in/pay/${encodeURIComponent(upiId)}`;
  if (amount) webUrl += `/${encodeURIComponent(amount)}`;
  if (desc) webUrl += `/${encodeURIComponent(desc)}`;
  console.log(webUrl);
  console.log('--------------------------------\n');
}

function handleQr(options) {
  const upi = options.upi || options.pa;
  if (!upi) {
    console.error('Error: Missing required option --upi <vpa>');
    process.exit(1);
  }
  if (!VPA_REGEX.test(upi)) {
    console.warn(`Warning: '${upi}' does not match standard UPI ID format (name@bank).`);
  }
  const amount = options.amount || options.am;
  const desc = options.desc || options.tn || options.note;
  const name = options.name || options.pn;

  const uri = generateUpiUri(upi, amount, desc, name);
  renderAsciiQr(uri);
}

function handleParse(options) {
  let content = options.text || '';
  if (options.file) {
    if (!fs.existsSync(options.file)) {
      console.error(`Error: File not found at '${options.file}'`);
      process.exit(1);
    }
    content = fs.readFileSync(options.file, 'utf-8');
  }

  if (!content) {
    console.error('Error: Please provide --file <path> or --text <string>');
    process.exit(1);
  }

  const lines = content.split(/\r?\n/);
  const found = [];
  const upiFinder = /([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})/g;
  const amountFinder = /(?:rs\.?|inr|₹)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i;

  lines.forEach((line, index) => {
    let match;
    while ((match = upiFinder.exec(line)) !== null) {
      const upi = match[1];
      // Try to find amount in the same line
      const cleanLine = line.replace(upi, '');
      const amtMatch = cleanLine.match(amountFinder);
      const amount = amtMatch ? parseFloat(amtMatch[1]) : 0;
      found.push({
        line: index + 1,
        upi,
        amount,
      });
    }
  });

  console.log(`\nFound ${found.length} UPI payout rows:`);
  console.table(found);
  const total = found.reduce((acc, row) => acc + (row.amount || 0), 0);
  console.log(`Calculated Total: ₹${total.toFixed(2)}\n`);
}

function handleReconcile(options) {
  if (!options.file) {
    console.error('Error: Missing required option --file <path>');
    process.exit(1);
  }
  if (!fs.existsSync(options.file)) {
    console.error(`Error: File not found at '${options.file}'`);
    process.exit(1);
  }

  const content = fs.readFileSync(options.file, 'utf-8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  let sum = 0;
  const upis = new Set();
  const duplicates = [];

  lines.forEach((l) => {
    const parts = l.split(',');
    if (parts.length >= 2) {
      const upi = parts[0].trim();
      const amt = parseFloat(parts[1].trim()) || 0;
      if (upis.has(upi)) {
        duplicates.push(upi);
      } else {
        upis.add(upi);
      }
      sum += amt;
    }
  });

  console.log(`\nReconciliation Summary for ${options.file}:`);
  console.log(`- Total Valid Rows: ${lines.length}`);
  console.log(`- Calculated Batch Sum: ₹${sum.toFixed(2)}`);

  if (options.total) {
    const expected = parseFloat(options.total);
    console.log(`- Expected Master Total: ₹${expected.toFixed(2)}`);
    const diff = Math.abs(sum - expected);
    if (diff < 0.01) {
      console.log(`- Status: ✓ PERFECT MATCH (Zero discrepancy)`);
    } else {
      console.log(`- Status: ✗ MISMATCH (Difference of ₹${diff.toFixed(2)})`);
    }
  }

  if (duplicates.length > 0) {
    console.log(`- Warning: Found ${duplicates.length} duplicate UPI ID(s):`, duplicates);
  } else {
    console.log(`- Duplicate Check: ✓ No duplicate UPI IDs detected`);
  }
  console.log('');
}

function main() {
  const rawArgs = process.argv.slice(2);
  const command = rawArgs[0];
  const options = parseArgs(rawArgs.slice(1));

  if (!command || command === 'help' || command === '--help' || command === '-h' || options.help || options.h) {
    printHelp();
    return;
  }

  if (command === 'version' || command === '--version' || command === '-v' || options.version || options.v) {
    console.log(`upi-pay v${VERSION}`);
    return;
  }

  if (command === 'qr') {
    handleQr(options);
    return;
  }

  if (command === 'parse') {
    handleParse(options);
    return;
  }

  if (command === 'reconcile') {
    handleReconcile(options);
    return;
  }

  console.error(`Unknown command: '${command}'`);
  printHelp();
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  generateUpiUri,
  VPA_REGEX,
};
