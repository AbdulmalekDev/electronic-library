import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Avatar,
  Chip,
  Stack,
  alpha,
} from "@mui/material";
import {
  School,
  Book,
  People,
  TrendingUp,
  Visibility,
  EmojiEvents,
  History,
  Flag,
  Lightbulb,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const About = () => {
  const features = [
    {
      icon: <Book sx={{ fontSize: 36 }} />,
      title: "مجموعة معرفية واسعة",
      description:
        "أكثر من 10,000 كتاب ومصدر في مختلف التخصصات العلمية والأدبية والتقنية",
    },
    {
      icon: <People sx={{ fontSize: 36 }} />,
      title: "خدمات متخصصة",
      description:
        "دعم فني واستشاري متكامل لمساعدة الباحثين والطلاب على مدار الساعة",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 36 }} />,
      title: "تكنولوجيا حديثة",
      description:
        "منصة رقمية متقدمة بواجهة سلسة وسريعة تضمن أفضل تجربة تصفح وقراءة",
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 36 }} />,
      title: "جودة واعتمادية",
      description: "فهرسة دقيقة ومصادر موثوقة يتم تحديثها ومراجعتها بانتظام",
    },
  ];

  const stats = [
    { label: "كتاب ومصدر", value: "10,000+" },
    { label: "قارئ ومستفيد", value: "2,500+" },
    { label: "سنوات من العطاء", value: "15+" },
    { label: "استعارة ناجحة", value: "8,000+" },
  ];

  const team = [
    {
      name: "د. عبد الملك الأحمد",
      role: "المشرف العام",
      description:
        "أستاذ علوم المعلومات وخبرة 15 سنة في إدارة المكتبات الرقمية",
      initials: "ع",
    },
    {
      name: "أ. فاطمة المنصور",
      role: "كبير أمناء المكتبة",
      description: "متخصصة في الفهرسة وتصنيف المصادر الرقمية الأكاديمية",
      initials: "ف",
    },
    {
      name: "م. محمد علي",
      role: "مهندس النظم والتقنية",
      description: "خبير تطوير برمجيات المكتبات وأنظمة الفهرسة الإلكترونية",
      initials: "م",
    },
    {
      name: "أ. زينب حسن",
      role: "مسؤولة الجودة والتطوير",
      description: "متخصصة في إثراء المحتوى المعرفي وتطوير تجربة القارئ",
      initials: "ز",
    },
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: "2px", md: 6 },
        px: { xs: "2px", md: 3 },
      }}

      // sx={{ py: 6 }}
    >
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 8 }}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              borderRadius: "50%",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              mb: 2,
            }}
          >
            <School sx={{ fontSize: 56 }} />
          </Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            color="text.primary"
          >
            مكتبة عبد الملك الإلكترونية
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.8 }}
          >
            صرح معرفي رقمي يهدف إلى خدمة الباحثين والطلاب والقراء العرب من خلال
            توفير بيئة تفاعلية ومصادر معرفية وثقافية عالية القيمة والجودة.
          </Typography>
        </motion.div>
      </Box>

      {/* Statistics */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 8 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <motion.div
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: "background.paper",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ mb: 0.5 }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {stat.label}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Vision & Mission */}
      <Grid container spacing={{ xs: 2, sm: 3, xl: 4 }} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            style={{ height: "100%" }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                p: { xs: 2, md: 3 },
                borderRadius: 4,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Visibility />
                  </Avatar>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    رؤيتنا
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9 }}
                >
                  أن نكون المنصة الرقمية الرائدة والموثوقة في الوطن العربي، عبر
                  إتاحة أحدث مصادر المعرفة وتمكين القارئ والباحث من الوصول السلس
                  للكتب والدراسات بمرونة وسهولة فائقة.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ height: "100%" }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                p: { xs: 2, md: 3 },
                borderRadius: 4,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.secondary.main, 0.08)
                    : alpha(theme.palette.secondary.main, 0.04),
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "secondary.main",
                      color: "white",
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Flag />
                  </Avatar>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    رسالتنا
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9 }}
                >
                  توفير بيئة رقمية محفزة على القراءة والتعلم المستمر، وتقديم
                  خدمات استعارة متطورة تلبي احتياجات مختلف فئات المجتمع مع
                  الالتزام بأعلى معايير الجودة والأمان الرقمي.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Features */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          gutterBottom
          fontWeight="bold"
          color="text.primary"
        >
          لماذا تختار مكتبة عبد الملك؟
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 5, maxWidth: 600, mx: "auto" }}
        >
          نقدم باقة متكاملة من المزايا التقنية والمعرفية التي تجعل تجربتك فريدة
          ومثمرة
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{ height: "100%" }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: 2,
                    borderRadius: 3,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: "background.paper",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      color="text.primary"
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Team */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          gutterBottom
          fontWeight="bold"
          color="text.primary"
        >
          فريق العمل
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 5, maxWidth: 600, mx: "auto" }}
        >
          نخبة من الأكاديميين والمتخصصين في علوم المكتبات وتكنولوجيا المعلومات
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{ height: "100%" }}
              >
                <Card
                  elevation={0}
                  sx={{
                    textAlign: "center",
                    height: "100%",
                    borderRadius: 3,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: "background.paper",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        mb: 2,
                        bgcolor: "primary.main",
                        color: "white",
                        fontSize: "1.75rem",
                        fontWeight: "bold",
                      }}
                    >
                      {member.initials}
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      color="text.primary"
                    >
                      {member.name}
                    </Typography>
                    <Chip
                      label={member.role}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2, fontSize: "0.75rem", fontWeight: 600 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* History */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              p: 1.5,
              borderRadius: "50%",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              mb: 2,
            }}
          >
            <History sx={{ fontSize: 44 }} />
          </Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            color="text.primary"
          >
            مسيرتنا المعرفية
          </Typography>
          <Typography
            variant="subtitle1"
            color="primary.main"
            fontWeight={600}
            sx={{ mb: 3 }}
          >
            تطور مستمر يواكب أحدث معايير التحول الرقمي
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: "auto", lineHeight: 1.9 }}
          >
            انطلقت مكتبة عبد الملك الإلكترونية برؤية طموحة تهدف إلى إثراء
            المحتوى المعرفي العربي وتسهيل استعارة وقراءة الكتب للجميع. واليوم،
            نواصل التوسع والتطوير لنقدم تجربة مكتبية حديثة تليق بتطلعات القراء
            والباحثين في كل مكان.
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default About;
