import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Button, TextField, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const steps = ["Name", "Personal Info", "Email", "Password"];

const signupSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  birthday: Yup.date().required('Birthday is required'),
  gender: Yup.string().required('Gender is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});


function Signup() {
  const [activeStep, setActiveStep] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const genders = ['Male', 'Female', 'Prefer Not To Say', 'Other'];
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { values, errors, touched, handleChange, handleSubmit, setTouched, setFieldTouched, isValid, dirty, resetForm, validateForm } = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      birthday: '',
      gender: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: signupSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
    enqueueSnackbar('Signed up successfully!', {
    variant: 'success',
  });
      navigate('/');
      resetForm();
      setFormSubmitted(true);
    },
  });

  const handleNext = async () => {
    const currentStepFields = Object.keys(getCurrentStepFields(activeStep));
    
    // Set touched status for current step fields to trigger error messages if any
    setTouched(currentStepFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    // Validate form fields and check if current step has errors
    const stepErrors = await validateForm();
    const hasErrors = currentStepFields.some(field => stepErrors[field]);
    
    if (!hasErrors) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getCurrentStepFields = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return { firstName: true, lastName: true };
      case 1:
        return { birthday: true, gender: true };
      case 2:
        return { email: true };
      case 3:
        return { password: true, confirmPassword: true };
      default:
        return {};
    }
  };

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <>
            <TextField
              label="First Name"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              error={touched.firstName && Boolean(errors.firstName)}
              helperText={touched.firstName && errors.firstName}
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              error={touched.lastName && Boolean(errors.lastName)}
              helperText={touched.lastName && errors.lastName}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              label="Birthday"
              name="birthday"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={values.birthday}
              onChange={handleChange}
              error={touched.birthday && Boolean(errors.birthday)}
              helperText={touched.birthday && errors.birthday}
            />
            <FormControl fullWidth error={touched.gender && Boolean(errors.gender)}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={values.gender}
                onChange={handleChange}
              >
                {genders.map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender}
                  </MenuItem>
                ))}
              </Select>
              {touched.gender && <FormHelperText>{errors.gender}</FormHelperText>}
            </FormControl>
          </>
        );
      case 2:
        return (
          <TextField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
          />
        );
      case 3:
        return (
          <>
            <TextField
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
            />
          </>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className='form'>
        <h1>Sign Up</h1>
    <form onSubmit={handleSubmit} className="stepper-form">
      {!formSubmitted && (
        <>
          <Stepper activeStep={activeStep} className="stepper-header">
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div className="step-content">{getStepContent(activeStep)}</div>
          <div className="stepper-buttons">
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={!dirty} onClick=''>
                Finish
              </Button>
            )}
          </div>
        </>
      )}
    </form>
    </div>
  );
}

export default Signup;
