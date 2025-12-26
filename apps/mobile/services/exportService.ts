/**
 * Export Service - Strategy export functionality
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

interface Strategy {
  id: string;
  title?: string;
  executiveSummary?: string;
  visionStatement?: string;
  keyStrengths: string[];
  criticalGaps: string[];
  recommendations: Array<{
    id: string;
    title: string;
    priority: string;
    summary: string;
    impact: string;
    currentState?: string;
    targetState?: string;
  }>;
  actionItems: Array<{
    id: string;
    title: string;
    description?: string;
    priority: string;
    effort: string;
    category?: string;
    status: string;
    expectedImpact?: string;
    dueDate?: string;
  }>;
  ninetyDayPriorities: string[];
  createdAt: string;
}

/**
 * Generate Markdown content from strategy
 */
export function generateMarkdown(strategy: Strategy, businessName?: string): string {
  const date = new Date(strategy.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let markdown = `# ${strategy.title || 'Growth Strategy'}\n\n`;
  markdown += `**Generated:** ${date}\n`;
  if (businessName) markdown += `**Business:** ${businessName}\n`;
  markdown += `\n---\n\n`;

  // Vision Statement
  if (strategy.visionStatement) {
    markdown += `## Your Vision\n\n`;
    markdown += `> ${strategy.visionStatement}\n\n`;
  }

  // Executive Summary
  if (strategy.executiveSummary) {
    markdown += `## Executive Summary\n\n`;
    markdown += `${strategy.executiveSummary}\n\n`;
  }

  // Key Strengths
  if (strategy.keyStrengths.length > 0) {
    markdown += `## Key Strengths\n\n`;
    strategy.keyStrengths.forEach((strength) => {
      markdown += `- ✓ ${strength}\n`;
    });
    markdown += `\n`;
  }

  // Critical Gaps
  if (strategy.criticalGaps.length > 0) {
    markdown += `## Critical Gaps\n\n`;
    strategy.criticalGaps.forEach((gap) => {
      markdown += `- ⚠️ ${gap}\n`;
    });
    markdown += `\n`;
  }

  // Recommendations
  if (strategy.recommendations.length > 0) {
    markdown += `## Strategic Recommendations\n\n`;
    strategy.recommendations.forEach((rec, index) => {
      markdown += `### ${index + 1}. ${rec.title}\n\n`;
      markdown += `**Priority:** ${rec.priority.toUpperCase()}\n\n`;
      markdown += `${rec.summary}\n\n`;
      if (rec.impact) {
        markdown += `**Expected Impact:** ${rec.impact}\n\n`;
      }
      if (rec.currentState && rec.targetState) {
        markdown += `| Current State | Target State |\n`;
        markdown += `|---------------|---------------|\n`;
        markdown += `| ${rec.currentState} | ${rec.targetState} |\n\n`;
      }
    });
  }

  // 90-Day Priorities
  if (strategy.ninetyDayPriorities.length > 0) {
    markdown += `## 90-Day Priorities\n\n`;
    strategy.ninetyDayPriorities.forEach((priority, index) => {
      markdown += `${index + 1}. ${priority}\n`;
    });
    markdown += `\n`;
  }

  // Action Items
  if (strategy.actionItems.length > 0) {
    markdown += `## Action Items\n\n`;
    markdown += `| # | Task | Priority | Effort | Status |\n`;
    markdown += `|---|------|----------|--------|--------|\n`;
    strategy.actionItems.forEach((item, index) => {
      const statusIcon = item.status === 'completed' ? '✅' : item.status === 'in_progress' ? '🔄' : '⬜';
      markdown += `| ${index + 1} | ${item.title} | ${item.priority} | ${item.effort} | ${statusIcon} |\n`;
    });
    markdown += `\n`;
  }

  // Footer
  markdown += `---\n\n`;
  markdown += `*Generated with Quento - AI-Powered Business Growth Platform*\n`;
  markdown += `*Powered by ServiceVision (https://www.servicevision.net)*\n`;

  return markdown;
}

/**
 * Generate HTML content from strategy for PDF export
 */
export function generateHTML(strategy: Strategy, businessName?: string): string {
  const date = new Date(strategy.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${strategy.title || 'Growth Strategy'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1A1A1A;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #2D5A3D;
      font-size: 28px;
      margin-bottom: 8px;
      border-bottom: 3px solid #2D5A3D;
      padding-bottom: 12px;
    }
    h2 {
      color: #2D5A3D;
      font-size: 20px;
      margin-top: 28px;
      margin-bottom: 12px;
    }
    h3 {
      font-size: 16px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    p {
      margin-bottom: 12px;
      color: #4A4A4A;
    }
    .meta {
      color: #666;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .vision-card {
      background: linear-gradient(135deg, #2D5A3D 0%, #4A7C5C 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .vision-label {
      font-size: 11px;
      letter-spacing: 1px;
      opacity: 0.8;
      margin-bottom: 8px;
    }
    .vision-text {
      font-size: 18px;
      font-style: italic;
      line-height: 1.5;
    }
    ul {
      margin-left: 20px;
      margin-bottom: 16px;
    }
    li {
      margin-bottom: 6px;
      color: #4A4A4A;
    }
    .strength-item {
      color: #2D7D46;
    }
    .gap-item {
      color: #D4A84B;
    }
    .recommendation-card {
      background: #F5F3EF;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .rec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .rec-title {
      font-weight: 600;
    }
    .priority-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .priority-high { background: #FEE2E2; color: #B91C1C; }
    .priority-medium { background: #FEF3C7; color: #B45309; }
    .priority-low { background: #DCFCE7; color: #15803D; }
    .priority-list {
      counter-reset: priority-counter;
      list-style: none;
      margin-left: 0;
    }
    .priority-list li {
      counter-increment: priority-counter;
      display: flex;
      align-items: center;
      background: #F5F3EF;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .priority-list li::before {
      content: counter(priority-counter);
      background: #2D5A3D;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #E8E4DD;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #F5F3EF;
      font-weight: 600;
      color: #2D5A3D;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E8E4DD;
      text-align: center;
      color: #8B7355;
      font-size: 12px;
    }
    .footer a {
      color: #4A7C5C;
    }
    @media print {
      body { padding: 20px; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <h1>${strategy.title || 'Growth Strategy'}</h1>
  <p class="meta">
    Generated: ${date}
    ${businessName ? `<br>Business: ${businessName}` : ''}
  </p>

  ${strategy.visionStatement ? `
  <div class="vision-card">
    <div class="vision-label">YOUR VISION</div>
    <div class="vision-text">${strategy.visionStatement}</div>
  </div>
  ` : ''}

  ${strategy.executiveSummary ? `
  <h2>Executive Summary</h2>
  <p>${strategy.executiveSummary}</p>
  ` : ''}

  ${strategy.keyStrengths.length > 0 ? `
  <h2>Key Strengths</h2>
  <ul>
    ${strategy.keyStrengths.map(s => `<li class="strength-item">✓ ${s}</li>`).join('')}
  </ul>
  ` : ''}

  ${strategy.criticalGaps.length > 0 ? `
  <h2>Critical Gaps</h2>
  <ul>
    ${strategy.criticalGaps.map(g => `<li class="gap-item">⚠ ${g}</li>`).join('')}
  </ul>
  ` : ''}

  ${strategy.recommendations.length > 0 ? `
  <h2>Strategic Recommendations</h2>
  ${strategy.recommendations.map((rec, i) => `
    <div class="recommendation-card">
      <div class="rec-header">
        <span class="rec-title">${i + 1}. ${rec.title}</span>
        <span class="priority-badge priority-${rec.priority}">${rec.priority}</span>
      </div>
      <p>${rec.summary}</p>
      ${rec.impact ? `<p><strong>Expected Impact:</strong> ${rec.impact}</p>` : ''}
    </div>
  `).join('')}
  ` : ''}

  ${strategy.ninetyDayPriorities.length > 0 ? `
  <h2>90-Day Priorities</h2>
  <ol class="priority-list">
    ${strategy.ninetyDayPriorities.map(p => `<li>${p}</li>`).join('')}
  </ol>
  ` : ''}

  ${strategy.actionItems.length > 0 ? `
  <h2>Action Items</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Task</th>
        <th>Priority</th>
        <th>Effort</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${strategy.actionItems.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.title}</td>
          <td>${item.priority}</td>
          <td>${item.effort}</td>
          <td>${item.status === 'completed' ? '✅' : item.status === 'in_progress' ? '🔄' : '⬜'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    <p>Generated with <strong>Quento</strong> - AI-Powered Business Growth Platform</p>
    <p>Powered by <a href="https://www.servicevision.net">ServiceVision</a></p>
  </div>
</body>
</html>
`;
}

/**
 * Export strategy as Markdown file
 */
export async function exportAsMarkdown(
  strategy: Strategy,
  businessName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const markdown = generateMarkdown(strategy, businessName);
    const fileName = `quento-strategy-${strategy.id.slice(0, 8)}.md`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, markdown, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/markdown',
        dialogTitle: 'Export Strategy',
        UTI: 'net.daringfireball.markdown',
      });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Export strategy as PDF file
 */
export async function exportAsPDF(
  strategy: Strategy,
  businessName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateHTML(strategy, businessName);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const fileName = `quento-strategy-${strategy.id.slice(0, 8)}.pdf`;
    const newUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Strategy',
        UTI: 'com.adobe.pdf',
      });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF export failed',
    };
  }
}

/**
 * Copy strategy as text to clipboard
 */
export function generatePlainText(strategy: Strategy, businessName?: string): string {
  let text = `${strategy.title || 'Growth Strategy'}\n`;
  text += `${'='.repeat(40)}\n\n`;

  if (strategy.visionStatement) {
    text += `YOUR VISION\n"${strategy.visionStatement}"\n\n`;
  }

  if (strategy.executiveSummary) {
    text += `EXECUTIVE SUMMARY\n${strategy.executiveSummary}\n\n`;
  }

  if (strategy.keyStrengths.length > 0) {
    text += `KEY STRENGTHS\n`;
    strategy.keyStrengths.forEach((s) => {
      text += `• ${s}\n`;
    });
    text += `\n`;
  }

  if (strategy.criticalGaps.length > 0) {
    text += `CRITICAL GAPS\n`;
    strategy.criticalGaps.forEach((g) => {
      text += `• ${g}\n`;
    });
    text += `\n`;
  }

  if (strategy.ninetyDayPriorities.length > 0) {
    text += `90-DAY PRIORITIES\n`;
    strategy.ninetyDayPriorities.forEach((p, i) => {
      text += `${i + 1}. ${p}\n`;
    });
    text += `\n`;
  }

  text += `\n---\nGenerated with Quento\n`;
  return text;
}
