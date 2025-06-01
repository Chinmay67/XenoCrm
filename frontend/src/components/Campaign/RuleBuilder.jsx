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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const FIELD_OPTIONS = [
  { value: "total_spend", label: "Total Spend (₹)", type: "number" },
  { value: "visits_count", label: "Visit Count", type: "number" },
  { value: "last_active_at", label: "Days Since Last Active", type: "number" },
];

const OPERATOR_OPTIONS = [
  { value: ">", label: "Greater than" },
  { value: "<", label: "Less than" },
  { value: ">=", label: "Greater than or equal" },
  { value: "<=", label: "Less than or equal" },
  { value: "=", label: "Equal to" },
];

const DEFAULT_CONDITION = {
  field: "total_spend",
  operator: ">",
  value: "",
  logic: "AND",
};

const RuleBuilder = ({ rules, onChange }) => {
  const [ruleGroups, setRuleGroups] = useState(
    rules || [
      {
        conditions: [
          {
            field: "",
            operator: "",
            value: "",
            logic: "AND", // Default logic for first condition
          },
        ],
      },
    ]
  );

  const addRuleGroup = () => {
    const newGroups = [
      ...ruleGroups,
      {
        conditions: [
          {
            field: "",
            operator: "",
            value: "",
            logic: "AND", // Default logic for new group's first condition
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
      field: "",
      operator: "",
      value: "",
      logic: "AND", // Default logic for new condition
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

  const getFieldLabel = (fieldValue) => {
    const field = FIELD_OPTIONS.find((f) => f.value === fieldValue);
    return field ? field.label : fieldValue;
  };

  const getOperatorLabel = (operatorValue) => {
    const operator = OPERATOR_OPTIONS.find((o) => o.value === operatorValue);
    return operator ? operator.label : operatorValue;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Audience Segmentation Rules
      </Typography>

      {ruleGroups.map((group, groupIndex) => (
        <Paper
          key={groupIndex}
          sx={{ p: 3, mb: 2, border: "1px solid #e0e0e0" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Rule Group {groupIndex + 1}
            </Typography>
            {ruleGroups.length > 1 && (
              <IconButton
                onClick={() => removeRuleGroup(groupIndex)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          {group.conditions.map((condition, conditionIndex) => (
            <Box key={conditionIndex} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <FormControl sx={{ minWidth: 200 }}>
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
                  >
                    {FIELD_OPTIONS.map((field) => (
                      <MenuItem key={field.value} value={field.value}>
                        {field.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
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
                      <MenuItem key={operator.value} value={operator.value}>
                        {operator.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                  sx={{ minWidth: 120 }}
                />

                {group.conditions.length > 1 && (
                  <IconButton
                    onClick={() => removeCondition(groupIndex, conditionIndex)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              {conditionIndex < group.conditions.length - 1 && (
                <Box sx={{ textAlign: "center", my: 1 }}>
                  <Chip
                    label={condition.logic}
                    size="small"
                    onClick={() => updateLogic(groupIndex, conditionIndex)}
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              )}
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => addCondition(groupIndex)}
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
          >
            Add Condition
          </Button>

          {groupIndex < ruleGroups.length - 1 && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Divider />
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "primary.main", fontWeight: "bold" }}
              >
                OR
              </Typography>
            </Box>
          )}
        </Paper>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addRuleGroup}
        variant="contained"
        sx={{ mt: 2 }}
      >
        Add Rule Group
      </Button>

      {/* Rule Summary */}
      {ruleGroups.some((group) =>
        group.conditions.some((c) => c.field && c.operator && c.value)
      ) && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" gutterBottom>
            Rule Summary:
          </Typography>
          <Typography variant="body2">
            {ruleGroups
              .map((group, groupIndex) => {
                const validConditions = group.conditions.filter(
                  (c) => c.field && c.operator && c.value
                );
                if (validConditions.length === 0) return "";

                const groupText = validConditions
                  .map((condition, idx) => {
                    const conditionText = `${getFieldLabel(
                      condition.field
                    )} ${getOperatorLabel(condition.operator)} ${
                      condition.value
                    }`;
                    return idx < validConditions.length - 1
                      ? `${conditionText} ${condition.logic}`
                      : conditionText;
                  })
                  .join(" ");

                return groupIndex > 0 ? ` OR (${groupText})` : `(${groupText})`;
              })
              .filter(Boolean) // Remove empty strings
              .join("")}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default RuleBuilder;
