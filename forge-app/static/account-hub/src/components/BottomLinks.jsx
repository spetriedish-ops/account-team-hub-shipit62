import React, { useState } from "react";

/**
 * BottomLinks — Quick access links at the bottom of the Hub
 * Props:
 *   accountId: Used to construct dynamic links to Jira board, meeting notes, etc.
 *   jiraBoardUrl: Direct link to the account's Jira board
 *   confluenceSpaceUrl: Link to the account's Confluence space
 *   supportQueueUrl: Link to JSM support queue for this account
 */

const BottomLinks = ({ accountId, jiraBoardUrl = "#", confluenceSpaceUrl = "#", supportQueueUrl = "#" }) => {
  const links = [
    {
      label: "Meeting Notes",
      description: "Access shared meeting notes and action items",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: confluenceSpaceUrl,
    },
    {
      label: "Jira Board",
      description: "View the account Jira board and backlog",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      href: jiraBoardUrl,
    },
    {
      label: "Support Queue",
      description: "Monitor open support tickets and SLAs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3zm16 0a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h1a2 2 0 012 2v3z" />
        </svg>
      ),
      href: supportQueueUrl,
    },
  ];

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {links.map((link, i) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="atlassian-card-interactive p-4 flex items-start gap-3 group cursor-pointer no-underline"
        >
          <div className="p-2 rounded bg-blue-50 text-primary group-hover:bg-blue-100 transition-colors">
            {link.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-[hsl(216,33%,17%)]">{link.label}</p>
              <svg className="w-3 h-3 text-[hsl(215,16%,47%)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-xs text-[hsl(215,16%,47%)] mt-0.5">{link.description}</p>
          </div>
        </a>
      ))}
    </div>
  );
};

export default BottomLinks;
