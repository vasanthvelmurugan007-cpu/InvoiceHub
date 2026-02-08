import React from 'react';

const Skeleton = ({ width, height, borderRadius = '4px', style, className }) => {
    return (
        <div
            className={`skeleton-loader ${className || ''}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius: borderRadius,
                ...style
            }}
        />
    );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="skeleton-table">
            <div className="skeleton-header flex gap-md mb-md">
                {Array(columns).fill(0).map((_, i) => (
                    <Skeleton key={i} height="30px" />
                ))}
            </div>
            {Array(rows).fill(0).map((_, i) => (
                <div key={i} className="skeleton-row flex gap-md mb-sm">
                    {Array(columns).fill(0).map((_, j) => (
                        <Skeleton key={j} height="40px" />
                    ))}
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton = () => (
    <div className="card">
        <div className="flex justify-between mb-md">
            <Skeleton width="40%" height="20px" />
            <Skeleton width="10%" height="20px" />
        </div>
        <Skeleton width="80%" height="30px" className="mb-sm" />
        <Skeleton width="60%" height="15px" />
    </div>
);

export default Skeleton;
