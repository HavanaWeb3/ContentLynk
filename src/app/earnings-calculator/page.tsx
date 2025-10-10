'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EarningsCalculator() {
  // Tier data
  const TIERS = {
    STANDARD: { share: 0.55, name: 'Standard', percentage: '55%' },
    SILVER: { share: 0.60, name: 'Silver', percentage: '60%' },
    GOLD: { share: 0.65, name: 'Gold', percentage: '65%' },
    PLATINUM: { share: 0.70, name: 'Platinum', percentage: '70%' },
    GENESIS: { share: 0.75, name: 'Genesis', percentage: '75%' }
  };

  // State
  const [tier, setTier] = useState<keyof typeof TIERS>('GOLD');
  const [likes, setLikes] = useState(100);
  const [comments, setComments] = useState(25);
  const [shares, setShares] = useState(10);
  const [hasNFT, setHasNFT] = useState(false);
  const [postsPerMonth, setPostsPerMonth] = useState(20);
  const tokenPrice = 0.75;

  // Calculate earnings
  const calculate = () => {
    // Quality score
    const qualityScore = likes * 1 + comments * 5 + shares * 20;

    // Base earnings
    const baseEarnings = qualityScore * 0.10;

    // Apply multipliers
    const nftMultiplier = hasNFT ? 1.5 : 1;
    const tierMultiplier = TIERS[tier].share / TIERS.STANDARD.share;

    // Calculate totals
    const totalUSD = baseEarnings * nftMultiplier * tierMultiplier;
    const tokens = totalUSD / tokenPrice;
    const monthly = totalUSD * postsPerMonth;

    return {
      qualityScore,
      totalUSD,
      tokens: Math.round(tokens),
      monthly
    };
  };

  const results = calculate();

  return (
    <div className="earnings-calculator-page">
      <style jsx>{`
        .earnings-calculator-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FBB03B 100%);
          padding: 20px;
        }

        .header {
          max-width: 800px;
          margin: 0 auto 30px;
          text-align: center;
          color: white;
        }

        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .header p {
          font-size: 1.2em;
          opacity: 0.95;
        }

        .calculator-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          overflow: hidden;
        }

        .calculator-body {
          padding: 40px 30px;
        }

        .section {
          margin-bottom: 35px;
        }

        .section-title {
          font-size: 1.3em;
          color: #FF6B35;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .tier-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .tier-option {
          padding: 15px 10px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: white;
        }

        .tier-option:hover {
          border-color: #FF6B35;
        }

        .tier-option.active {
          border-color: #FF6B35;
          background: #FFF5F0;
        }

        .tier-option .tier-name {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .tier-option .tier-share {
          font-size: 0.9em;
          color: #666;
        }

        .slider-group {
          margin-bottom: 25px;
        }

        .slider-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .slider-label .value {
          font-weight: bold;
          color: #FF6B35;
          font-size: 1.3em;
          min-width: 80px;
          text-align: right;
        }

        input[type="range"] {
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: #e0e0e0;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255,107,53,0.4);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(255,107,53,0.4);
        }

        .toggle-group {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 10px;
        }

        .toggle-switch {
          position: relative;
          width: 60px;
          height: 30px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 30px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(30px);
        }

        .results {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-top: 30px;
        }

        .earnings-display {
          text-align: center;
          padding: 30px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }

        .earnings-display .label {
          font-size: 1.2em;
          opacity: 0.9;
          margin-bottom: 10px;
        }

        .earnings-display .amount {
          font-size: 3.5em;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .monthly-projection {
          margin-top: 20px;
          padding: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          text-align: center;
        }

        .monthly-posts {
          display: flex;
          gap: 10px;
          margin: 15px 0;
          justify-content: center;
          flex-wrap: wrap;
        }

        .post-option {
          padding: 10px 20px;
          background: rgba(255,255,255,0.2);
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .post-option:hover {
          background: rgba(255,255,255,0.3);
        }

        .post-option.active {
          background: rgba(255,255,255,0.3);
          border-color: white;
        }

        .cta-section {
          padding: 30px;
          text-align: center;
          background: #f9f9f9;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          padding: 18px 40px;
          font-size: 1.3em;
          font-weight: bold;
          text-decoration: none;
          border-radius: 50px;
          box-shadow: 0 8px 20px rgba(255,107,53,0.3);
          transition: all 0.3s;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(255,107,53,0.4);
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2em;
          }
          .earnings-display .amount {
            font-size: 2.5em;
          }
        }
      `}</style>

      <div className="header">
        <h1>🐘 Contentlynk Earnings Calculator</h1>
        <p>See what you could earn with fair creator compensation</p>
      </div>

      <div className="calculator-container">
        <div className="calculator-body">
          {/* Tier Selection */}
          <div className="section">
            <h2 className="section-title">🎯 Select Your Tier</h2>
            <div className="tier-selector">
              {(Object.keys(TIERS) as Array<keyof typeof TIERS>).map((tierKey) => (
                <div
                  key={tierKey}
                  className={`tier-option ${tier === tierKey ? 'active' : ''}`}
                  onClick={() => setTier(tierKey)}
                >
                  <div className="tier-name">{TIERS[tierKey].name}</div>
                  <div className="tier-share">{TIERS[tierKey].percentage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Inputs */}
          <div className="section">
            <h2 className="section-title">📊 Your Typical Post Engagement</h2>

            <div className="slider-group">
              <div className="slider-label">
                <span>👍 Likes</span>
                <span className="value">{likes}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={likes}
                step="10"
                onChange={(e) => setLikes(parseInt(e.target.value))}
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>💬 Comments</span>
                <span className="value">{comments}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={comments}
                step="5"
                onChange={(e) => setComments(parseInt(e.target.value))}
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>🔄 Shares</span>
                <span className="value">{shares}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={shares}
                step="1"
                onChange={(e) => setShares(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* NFT Bonus Toggle */}
          <div className="section">
            <h2 className="section-title">🎨 Creator Pass NFT</h2>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={hasNFT}
                  onChange={(e) => setHasNFT(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span style={{ fontWeight: 600 }}>I have Creator Pass NFT (+50% bonus)</span>
            </div>
          </div>

          {/* Results */}
          <div className="results">
            <div className="earnings-display">
              <div className="label">You Earn Per Post:</div>
              <div className="amount">${results.totalUSD.toFixed(2)}</div>
              <div style={{ fontSize: '1.2em', opacity: 0.9 }}>
                ({results.tokens} $HVNA tokens)
              </div>
            </div>

            {/* Monthly Projection */}
            <div className="monthly-projection">
              <div style={{ fontSize: '1.2em', marginBottom: '10px', opacity: 0.9 }}>
                📅 Monthly Earnings Projection
              </div>
              <p style={{ marginBottom: '10px', opacity: 0.9 }}>
                If you post consistently:
              </p>
              <div className="monthly-posts">
                {[10, 20, 30, 50].map((posts) => (
                  <div
                    key={posts}
                    className={`post-option ${postsPerMonth === posts ? 'active' : ''}`}
                    onClick={() => setPostsPerMonth(posts)}
                  >
                    {posts} posts/mo
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', marginTop: '15px' }}>
                ${results.monthly.toFixed(2)}/month
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-section">
            <p style={{ fontSize: '1.2em', marginBottom: '20px', color: '#666' }}>
              Ready to start earning fairly?
            </p>
            <Link href="/beta#apply" className="cta-button">
              Apply for Beta Access →
            </Link>
            <p style={{ marginTop: '15px', color: '#999' }}>
              ✓ Zero follower requirements &nbsp; ✓ Start earning day one &nbsp; ✓ 100% transparent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
