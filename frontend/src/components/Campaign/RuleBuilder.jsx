import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Collapse,
  InputAdornment,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  FlashOn as FlashOnIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const FIELD_OPTIONS = [
  {
    value: "total_spend",
    label: "Total Spend",
    type: "number",
    icon: "💰",
    unit: "₹",
    description: "Customer's lifetime spending",
  },
  {
    value: "visits_count",
    label: "Visit Count",
    type: "number",
    icon: "🚪",
    unit: "visits",
    description: "Number of store/website visits",
  },
  {
    value: "last_active_at",
    label: "Days Since Last Active",
    type: "number",
    icon: "📅",
    unit: "days",
    description: "Days since last activity",
  },
];

const OPERATOR_OPTIONS = [
  { value: ">", label: "Greater than", symbol: ">" },
  { value: "<", label: "Less than", symbol: "<" },
  { value: ">=", label: "Greater than or equal", symbol: "≥" },
  { value: "<=", label: "Less than or equal", symbol: "≤" },
  { value: "=", label: "Equal to", symbol: "=" },
];

// Styled components
const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  "& .MuiTypography-root": {
    color: "white",
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[8],
  },
}));

const ConditionCard = styled(Card)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.grey[50],
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + "10",
    transform: "translateY(-1px)",
  },
}));

const LogicChip = styled(Chip)(({ theme, logic }) => ({
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backgroundColor:
    logic === "AND" ? theme.palette.info.light : theme.palette.warning.light,
  color: logic === "AND" ? theme.palette.info.dark : theme.palette.warning.dark,
  "&:hover": {
    transform: "scale(1.05)",
    backgroundColor:
      logic === "AND" ? theme.palette.info.main : theme.palette.warning.main,
    color: "white",
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.primary.main} 90%)`,
  borderRadius: 20,
  padding: "12px 32px",
  fontSize: "1rem",
  fontWeight: "bold",
  boxShadow: theme.shadows[6],
  transition: "all 0.3s ease",
  "&:hover": {
    background: `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.primary.dark} 90%)`,
    transform: "scale(1.05)",
    boxShadow: theme.shadows[12],
  },
}));

const RuleBuilder = ({ rules, onChange }) => {
  const [ruleGroups, setRuleGroups] = useState(
    rules || [
      {
        conditions: [
          {
            field: "",
            operator: "",
            value: "",
            logic: "AND", // only needed between conditions within a group
          },
        ],
      },
    ]
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const addRuleGroup = () => {
    const newGroups = [
      ...ruleGroups,
      {
        conditions: [
          {
            field: "",
            operator: "",
            value: "",
            logic: "AND",
          },
        ],
      },
    ];
    setRuleGroups(newGroups);
    onChange(newGroups);
  };

  const removeRuleGroup = (groupIndex) => {
    const newGroups = ruleGroups.filter((_, index) => index !== groupIndex);
    setRuleGroups(newGroups);
    onChange(newGroups);
  };

  const addCondition = (groupIndex) => {
    const newGroups = [...ruleGroups];
    newGroups[groupIndex].conditions.push({
      // id: Date.now(),
      field: "",
      operator: "",
      value: "",
      logic: "AND",
    });
    setRuleGroups(newGroups);
    onChange(newGroups);
  };

  const removeCondition = (groupIndex, conditionIndex) => {
    const newGroups = [...ruleGroups];
    newGroups[groupIndex].conditions = newGroups[groupIndex].conditions.filter(
      (_, index) => index !== conditionIndex
    );
    setRuleGroups(newGroups);
    onChange(newGroups);
  };

  const updateCondition = (groupIndex, conditionIndex, field, value) => {
    const newGroups = [...ruleGroups];
    newGroups[groupIndex].conditions[conditionIndex][field] = value;
    setRuleGroups(newGroups);
    onChange(newGroups);
  };

  const updateLogic = (groupIndex, conditionIndex) => {
    const newGroups = [...ruleGroups];
    const currentLogic = newGroups[groupIndex].conditions[conditionIndex].logic;
    newGroups[groupIndex].conditions[conditionIndex].logic =
      currentLogic === "AND" ? "OR" : "AND";
    setRuleGroups(newGroups);
    onChange(newGroups);
  };

  const getFieldData = (fieldValue) => {
    return FIELD_OPTIONS.find((f) => f.value === fieldValue);
  };

  const getOperatorData = (operatorValue) => {
    return OPERATOR_OPTIONS.find((o) => o.value === operatorValue);
  };

  const getValidConditionsCount = () => {
    return ruleGroups.reduce((total, group) => {
      return (
        total +
        group.conditions.filter((c) => c.field && c.operator && c.value).length
      );
    }, 0);
  };

  const generateRuleSummary = () => {
    const validGroups = ruleGroups
      .map((group, groupIndex) => {
        const validConditions = group.conditions.filter(
          (c) => c.field && c.operator && c.value
        );

        if (validConditions.length === 0) return null;

        const groupText = validConditions
          .map((condition, idx) => {
            const fieldData = getFieldData(condition.field);
            const operatorData = getOperatorData(condition.operator);

            const conditionText = `${fieldData?.label || condition.field} ${
              operatorData?.symbol || condition.operator
            } ${condition.value}${fieldData?.unit ? " " + fieldData.unit : ""}`;

            return idx < validConditions.length - 1
              ? `${conditionText} ${condition.logic}`
              : conditionText;
          })
          .join(" ");

        return groupIndex > 0 ? `OR (${groupText})` : `(${groupText})`;
      })
      .filter(Boolean)
      .join(" ");

    return validGroups || "No valid rules defined";
  };

  const RuleSummary = () => (
    <Card
      sx={{
        mt: 4,
        mb: 2,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: 8,
        border: "1px solid",
        borderColor: "primary.light",
      }}
    >
      <GradientPaper elevation={0}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <VisibilityIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" fontWeight="bold">
              Rule Summary
            </Typography>
          }
        />
      </GradientPaper>
      <CardContent sx={{ p: 3 }}>
        <Paper
          sx={{
            p: 3,
            bgcolor: "grey.50",
            borderLeft: 4,
            borderColor: "primary.main",
            fontFamily: "monospace",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Targeting customers where:
          </Typography>
          <Typography
            variant="body1"
            fontWeight="medium"
            color="text.primary"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {generateRuleSummary()}
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        p: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            }}
          >
            <PeopleIcon />
          </Avatar>
          <Typography variant="h3" fontWeight="bold" color="text.primary">
            Audience Builder
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Create targeted segments with smart filtering rules
        </Typography>

        {/* Stats Bar */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StatsCard>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary">
                Active Rules
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {getValidConditionsCount()}
              </Typography>
            </CardContent>
          </StatsCard>

          <StatsCard>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary">
                Rule Groups
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {ruleGroups.length}
              </Typography>
            </CardContent>
          </StatsCard>

          <StatsCard
            sx={{ cursor: "pointer" }}
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VisibilityIcon fontSize="small" />
                <Typography variant="body2" fontWeight="medium">
                  Preview
                </Typography>
                <ExpandMoreIcon
                  sx={{
                    transform: isPreviewOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                  fontSize="small"
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Box>
      </Box>

      {/* Rule Groups */}
      <Box sx={{ mb: 4 }}>
        {ruleGroups.map((group, groupIndex) => (
          <Fade in key={group.id} timeout={500}>
            <Box sx={{ mb: 4 }}>
              <Card
                sx={{
                  overflow: "visible",
                  boxShadow: 6,
                  borderRadius: 4,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 12,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Group Header */}
                <GradientPaper
                  elevation={0}
                  sx={{ borderRadius: "16px 16px 0 0" }}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                        <Typography fontWeight="bold">
                          {groupIndex + 1}
                        </Typography>
                      </Avatar>
                    }
                    title={
                      <Typography variant="h6" fontWeight="bold">
                        Rule Group {groupIndex + 1}
                      </Typography>
                    }
                    subheader={
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {
                          group.conditions.filter(
                            (c) => c.field && c.operator && c.value
                          ).length
                        }{" "}
                        active conditions
                      </Typography>
                    }
                    action={
                      ruleGroups.length > 1 && (
                        <Zoom in>
                          <IconButton
                            onClick={() => removeRuleGroup(groupIndex)}
                            sx={{
                              color: "white",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.2)",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Zoom>
                      )
                    }
                  />
                </GradientPaper>

                {/* Conditions */}
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {group.conditions.map((condition, conditionIndex) => (
                      <Box key={condition.id}>
                        <ConditionCard>
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "end",
                                flexWrap: "wrap",
                              }}
                            >
                              {/* Field Select */}
                              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                                <InputLabel>Field</InputLabel>
                                <Select
                                  value={condition.field}
                                  label="Field"
                                  onChange={(e) =>
                                    updateCondition(
                                      groupIndex,
                                      conditionIndex,
                                      "field",
                                      e.target.value
                                    )
                                  }
                                  sx={{
                                    "& .MuiSelect-select": {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    },
                                  }}
                                >
                                  {FIELD_OPTIONS.map((field) => (
                                    <MenuItem
                                      key={field.value}
                                      value={field.value}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <span>{field.icon}</span>
                                        {field.label}
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {/* Operator Select */}
                              <FormControl sx={{ minWidth: 150, flex: 1 }}>
                                <InputLabel>Operator</InputLabel>
                                <Select
                                  value={condition.operator}
                                  label="Operator"
                                  onChange={(e) =>
                                    updateCondition(
                                      groupIndex,
                                      conditionIndex,
                                      "operator",
                                      e.target.value
                                    )
                                  }
                                >
                                  {OPERATOR_OPTIONS.map((operator) => (
                                    <MenuItem
                                      key={operator.value}
                                      value={operator.value}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Typography fontWeight="bold">
                                          {operator.symbol}
                                        </Typography>
                                        {operator.label}
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {/* Value Input */}
                              <TextField
                                label="Value"
                                type="number"
                                value={condition.value}
                                onChange={(e) =>
                                  updateCondition(
                                    groupIndex,
                                    conditionIndex,
                                    "value",
                                    e.target.value
                                  )
                                }
                                sx={{ minWidth: 120, flex: 1 }}
                                InputProps={{
                                  endAdornment: condition.field && (
                                    <InputAdornment position="end">
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {getFieldData(condition.field)?.unit}
                                      </Typography>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              {/* Delete Condition */}
                              {group.conditions.length > 1 && (
                                <IconButton
                                  onClick={() =>
                                    removeCondition(groupIndex, conditionIndex)
                                  }
                                  color="error"
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "error.light",
                                      color: "white",
                                      transform: "scale(1.1)",
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          </CardContent>
                        </ConditionCard>

                        {/* Logic Connector */}
                        {conditionIndex < group.conditions.length - 1 && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              my: 2,
                            }}
                          >
                            <LogicChip
                              label={condition.logic}
                              onClick={() =>
                                updateLogic(groupIndex, conditionIndex)
                              }
                              logic={condition.logic}
                              size="medium"
                            />
                          </Box>
                        )}
                      </Box>
                    ))}

                    {/* Add Condition */}
                    <Button
                      onClick={() => addCondition(groupIndex)}
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{
                        p: 3,
                        borderStyle: "dashed",
                        borderWidth: 2,
                        borderRadius: 3,
                        "&:hover": {
                          borderStyle: "solid",
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      Add Condition
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* OR Connector between groups */}
              {groupIndex < ruleGroups.length - 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    my: 4,
                    position: "relative",
                  }}
                >
                  <Divider
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      right: 0,
                      borderStyle: "dashed",
                      borderWidth: 2,
                    }}
                  />
                  <Chip
                    label="OR"
                    sx={{
                      background:
                        "linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      px: 3,
                      py: 1,
                      zIndex: 1,
                      boxShadow: 4,
                    }}
                  />
                </Box>
              )}
            </Box>
          </Fade>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <AddButton
          onClick={addRuleGroup}
          startIcon={<FlashOnIcon />}
          variant="contained"
        >
          Add New Rule Group
        </AddButton>
      </Box>

      {/* Rule Summary */}
      <RuleSummary />

      {/* Add Rule Group */}

      {/* Rule Preview */}
      <Collapse in={isPreviewOpen && getValidConditionsCount() > 0}>
        <Card
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: 8,
            border: "1px solid",
            borderColor: "primary.light",
          }}
        >
          <GradientPaper elevation={0}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <VisibilityIcon />
                </Avatar>
              }
              title={
                <Typography variant="h6" fontWeight="bold">
                  Rule Preview
                </Typography>
              }
            />
          </GradientPaper>
          <CardContent sx={{ p: 3 }}>
            <Paper
              sx={{
                p: 3,
                bgcolor: "grey.50",
                borderLeft: 4,
                borderColor: "primary.main",
                fontFamily: "monospace",
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Targeting customers where:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="medium"
                color="text.primary"
              >
                {generateRuleSummary()}
              </Typography>
            </Paper>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This rule will match customers who meet the above criteria.
            </Typography>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
};

export default RuleBuilder;
