import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="text-indeed-blue hover:underline">
              Post your resume
            </a>
            <span>-</span>
            <span>and start applying for jobs today!</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>For jobs in the United States, visit <a href="#" className="text-indeed-blue hover:underline">www.indeed.com</a></p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
            <span>Indeed in other countries:</span>
            <a href="#" className="text-indeed-blue hover:underline">Jobs in Taiwan</a>
            <span>,</span>
            <a href="#" className="text-indeed-blue hover:underline">Jobs in Hong Kong</a>
            <span>,</span>
            <a href="#" className="text-indeed-blue hover:underline">Jobs in China</a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              您可以用以下言語瀏覽 Indeed: 
              <a href="#" className="text-indeed-blue hover:underline ml-1">中文(簡体)</a>
            </p>
          </div>
          
          <div className="border-t border-border pt-4">
            <button className="flex items-center justify-center mx-auto text-sm text-muted-foreground hover:text-indeed-blue">
              What's trending on Indeed
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
} 