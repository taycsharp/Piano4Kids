import React from 'react'
import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material'

export function StatCard({ title, value, icon }) {
  return (
    <Card className="statCard">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>{title}</Typography>
            <Typography variant="h4" fontWeight={900}>{value ?? 0}</Typography>
          </Box>
          <Avatar className="statIcon">{icon}</Avatar>
        </Stack>
      </CardContent>
    </Card>
  )
}

export function SectionHeader({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Avatar className="sectionIcon">{icon}</Avatar>
      <Box>
        <Typography variant="h5" fontWeight={900}>{title}</Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
      </Box>
    </Stack>
  )
}
