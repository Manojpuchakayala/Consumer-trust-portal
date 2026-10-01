import React from "react";
import "./SkeletonLoader.css";

export function SkeletonBox({ width = "100%", height = "20px", borderRadius = "6px", className = "" }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function ComplaintCardSkeleton() {
  return (
    <div className="skeleton-card complaint-card-skeleton">
      <div className="skeleton-row space-between">
        <SkeletonBox width="140px" height="24px" borderRadius="4px" />
        <SkeletonBox width="80px" height="22px" borderRadius="12px" />
      </div>
      <div style={{ marginTop: 12 }}>
        <SkeletonBox width="60%" height="18px" />
        <SkeletonBox width="90%" height="14px" style={{ marginTop: 8 }} />
        <SkeletonBox width="45%" height="14px" style={{ marginTop: 6 }} />
      </div>
      <div className="skeleton-row" style={{ marginTop: 16, gap: 10 }}>
        <SkeletonBox width="100px" height="30px" borderRadius="6px" />
        <SkeletonBox width="120px" height="30px" borderRadius="6px" />
      </div>
    </div>
  );
}

export function TrackingTimelineSkeleton() {
  return (
    <div className="skeleton-card tracking-skeleton">
      <div className="skeleton-row space-between" style={{ marginBottom: 16 }}>
        <SkeletonBox width="180px" height="28px" />
        <SkeletonBox width="100px" height="24px" borderRadius="12px" />
      </div>
      <div className="skeleton-timeline-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-stage">
            <SkeletonBox width="36px" height="36px" borderRadius="50%" />
            <SkeletonBox width="80px" height="14px" style={{ marginTop: 8 }} />
            <SkeletonBox width="60px" height="11px" style={{ marginTop: 4 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <SkeletonBox width="100%" height="80px" borderRadius="8px" />
      </div>
    </div>
  );
}

export function BrandCardSkeleton() {
  return (
    <div className="skeleton-card brand-card-skeleton">
      <div className="skeleton-row" style={{ gap: 12 }}>
        <SkeletonBox width="40px" height="40px" borderRadius="8px" />
        <div style={{ flex: 1 }}>
          <SkeletonBox width="120px" height="16px" />
          <SkeletonBox width="70px" height="12px" style={{ marginTop: 4 }} />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <SkeletonBox width="100%" height="8px" borderRadius="4px" />
      </div>
      <div className="skeleton-row space-between" style={{ marginTop: 14 }}>
        <SkeletonBox width="30%" height="32px" borderRadius="6px" />
        <SkeletonBox width="30%" height="32px" borderRadius="6px" />
        <SkeletonBox width="30%" height="32px" borderRadius="6px" />
      </div>
    </div>
  );
}
