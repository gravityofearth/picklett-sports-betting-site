import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import CircularProgress from '@mui/material/CircularProgress';

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
