import { Box, Typography } from "@mui/material";
import { lightBlue } from '@mui/material/colors';

export default function Recommendations() {
    return (
        <Box>
            <Box sx={{display: "flex", flexDirection : "col", justifyContent: "center", mt: "24px",width: 400, height: 50, padding: "16px 24px", backgroundColor: lightBlue['A400'], borderRadius: "25px 25px 0 0"}}>
                <Typography variant="h4" sx={{color: "white"}}>Our Recommendations</Typography>
            </Box>
            <Box sx={{mt: "0",width: 400, height: 300, padding: "16px 24px", backgroundColor: "white", borderRadius: "0 0 25px 25px"}}>
                <Typography variant="h5" sx={{color: "black"}}>Lorem Ipsum</Typography>
            </Box>
        </Box>
    )
}