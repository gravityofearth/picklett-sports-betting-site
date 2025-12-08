import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import CircularProgress from '@mui/material/CircularProgress';
import Highlighter from 'react-highlight-words';
import Link from 'next/link';

export function CircularIndeterminate() {
    return (
        <Box sx={{ display: 'flex' }}>
            <CircularProgress />
        </Box>
    );
}

export function ContinuousSlider({ value, setValue, min, max }: { value: number, setValue: React.Dispatch<React.SetStateAction<number>>, min: number, max: number }) {
    const handleChange = (event: Event, newValue: number) => {
        setValue(newValue);
    };
    return (
        <Box sx={{ width: 200 }}>
            <Slider min={min} max={max} step={0.1} aria-label="Slider" value={value} onChange={handleChange} />
        </Box>
    );
}

export const LinkOrButton = ({ disabled, children, href, className }: { disabled: boolean, children: React.ReactNode, href: string, className: string }) => {
    return (
        disabled ?
            <button disabled className={className}>{children}</button> :
            <Link href={href} className={className}>{children}</Link>
    )
}
export const SearchHighlight = ({ text, search, className }: { text: string, search: string, className?: string | undefined }) => {
    const reg = /"([^"]*)"/g;
    const matches = [];
    let match;
    while ((match = reg.exec(search)) !== null) {
        matches.push(match[1].trim());
    }
    return (
        <Highlighter
            highlightClassName={className}
            searchWords={search.includes("\"") ? matches : search.split(/\s/).filter(word => word)}
            autoEscape={true}
            textToHighlight={text}
        />
    )
}