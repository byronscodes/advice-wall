import { ToggleButtonGroup, ToggleButton } from '@mui/material';

export default function CloudSelector({ cloudMode, setCloudMode }) {
  const handleChange = (event, newMode) => {
    if (newMode !== null) setCloudMode(newMode);
  };

  return (
    <ToggleButtonGroup
      value={cloudMode}
      exclusive
      onChange={handleChange}
      color="primary"
      fullWidth
      size="small"
      sx ={{ backgroundColor: 'white', borderRadius: '8px', width: 'clamp(250px, 10vw, 300px)', float: 'right', margin: '20px'}}
    >
      <ToggleButton value="clustered" sx={{ textTransform: 'none'}}>Cloud</ToggleButton>
      <ToggleButton value="static" sx={{ textTransform: 'none'}}>Space</ToggleButton>
      <ToggleButton value="floating" sx={{ textTransform: 'none'}}>Float</ToggleButton>
    </ToggleButtonGroup>
  );
}
