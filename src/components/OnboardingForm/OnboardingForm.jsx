import React, { useState, useRef, useEffect } from "react";
import { InputLabel } from '@mui/material';
import "./OnBoardingForm.css";
import axios from 'axios';
import { Link } from 'react-router-dom';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';





const OnboardingForm = ({ formType, onFormSubmit, onPhotoCapture }) => {
  // const [formData, setFormData] = useState({});
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [photoData, setPhotoData] = useState(null);
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [isKYCCollapsed, setIsKYCCollapsed] = useState(true);
  const [isPersonalCollapsed, setIsPersonalCollapsed] = useState(true);
  const [isBankDetailsCollapsed, setIsBankDetailsCollapsed] = useState(true);
  const [isProjectCollapsed, setIsProjectCollapsed] = useState(true);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [projectCompleted, setProjectCompleted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    contactNumber: '',
    gender: '',
    dateOfJoining: '',
    address: '',
    pincode: '',
    taluka: '',
    district: '',
    village: '',
    state: '',
    emergencyContact:'',
    labourOwnership: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    ifscCode: '',
    jobRole: '',
    jobLocation: '',
    contractorName: '',
    contractorNumber: '',
  });

  const [formStatus, setFormStatus] = useState({
    kyc: false,
    personal: false,
    bankDetails: false,
    project: false
  });

  const toggleKYCCollapse = () => {
    setIsKYCCollapsed(!isKYCCollapsed);
  };

  const togglePersonalCollapse = () => {
    setIsPersonalCollapsed(!isPersonalCollapsed);
  };

  const toggleBankDetailsCollapse = () => {
    setIsBankDetailsCollapsed(!isBankDetailsCollapsed);
  };

  const toggleProjectCollapse = () => {
    setIsProjectCollapsed(!isProjectCollapsed);
  };
  const renderRequiredAsterisk = (isRequired) => {
    return isRequired ? <span style={{ color: "red" }}> *</span> : null;
  };
  const getBulletColor = () => {
    if (formType === "kyc") {
      return kycCompleted ? '#20C305' : '#FFBF00';
    } else if (formType === "project") {
      return projectCompleted ? '#20C305' : '#FFBF00';
    } else {
      return '#FFBF00'; // Default color
    }
  };
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    let age = today.getFullYear() - selectedDate.getFullYear();
    const birthdayThisYear = new Date(today.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    if (today < birthdayThisYear) {
      age--;
    }
    if (age < 18) {
      setErrorMessage('Age must be 18 or older.');
    } else {
      setErrorMessage('');
    }
    setDateOfBirth(e.target.value);
  };


  const validateForm = () => {
    const requiredFields = [
       'name', 'aadhaarNumber', 'dateOfBirth', 'contactNumber', 'gender', 'dateOfJoining', 
      'address', 'pincode', 'taluka', 'district', 'village', 'state', 
      'emergencyContact', 'bankName', 'branch', 'accountNumber', 'ifscCode', 
      // 'jobRole', 'jobLocation',
      //  'contractorName','contractorNumber'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field} field.`);
        return false;
      }
    }

    if (!formData.village) {
      toast.warn("Village field is empty. Please consider filling it.");
    }

    return true;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log(`Submitting ${formType} form`, formData);
    onFormSubmit(formType);

    if (formType === "kyc") {
      setKycCompleted(true);
    } else if (formType === "project") {
      setProjectCompleted(true);
    }

    toast.success("Form submitted successfully!");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log("Selected file:", file);
    setAadhaarImage(file);
    uploadAadhaarImageToSurepass(file);
  };


  const uploadAadhaarImageToOCRSpace = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', 'YOUR_OCR_API_KEY');
    formData.append('language', 'eng');

    try {
      const response = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { ParsedResults } = response.data;
      if (ParsedResults && ParsedResults.length > 0) {
        const parsedData = ParsedResults[0];
        setFormData({
          aadhaarNumber: parsedData.ParsedText.match(/\d{4}\s\d{4}\s\d{4}/)[0],
          name: parsedData.ParsedText.match(/(Name)(.*?)(Father|Mother|Spouse)/)[2].trim(),
          dateOfBirth: parsedData.ParsedText.match(/\d{2}\/\d{2}\/\d{4}/)[0],
        });
      }
    } catch (error) {
      console.error('Error uploading Aadhaar image to OCR.space:', error);
    }
  };
  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData({ ...formData, pincode });

    if (pincode.length === 6) {
      try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

        if (response.data && response.data[0] && response.data[0].Status === "Success") {
          const postOffice = response.data[0].PostOffice[0];
          setFormData((prevFormData) => ({
            ...prevFormData,
            village: postOffice.Name,
            taluka: postOffice.Block,
            district: postOffice.District,
            state: postOffice.State
          }));
        } else {
          console.error('Location data not found');
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    }
  };



  const uploadAadhaarImageToSurepass = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://kyc-api.aadhaarkyc.io/api/v1/ocr/aadhaar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY0NzEwNDcxNCwianRpIjoiOWNhMDViZTAtZTMwYS00NTc5LTk5MzEtYWY3MmVmYzg1ZGFhIiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2LmphdmRla2Fyc0BhYWRoYWFyYXBpLmlvIiwibmJmIjoxNjQ3MTA0NzE0LCJleHAiOjE5NjI0NjQ3MTQsInVzZXJfY2xhaW1zIjp7InNjb3BlcyI6WyJyZWFkIl19fQ.cGYIaxfNm0BDCol5_7I1DaJFZE-jXSel2E63EHl2A4A'
        }
      });

      const { data } = response;
      console.log(data)
      if (data && data.success && data.data && data.data.ocr_fields && data.data.ocr_fields.length > 0) {
        const ocrFields = data.data.ocr_fields[0];

        setFormData({
          aadhaarNumber: ocrFields.aadhaar_number.value,
          name: ocrFields.full_name.value,
          dateOfBirth: ocrFields.dob.value,
          gender: ocrFields.gender.value,
          village: formData.village,
          taluka: formData.taluka,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode
        });
        setDateOfBirth(ocrFields.dob.value);
      } else {
        console.error('Error uploading Aadhaar image to Surepass: OCR fields not found in response');
      }
    } catch (error) {
      console.error('Error uploading Aadhaar image to Surepass:', error);
    }
  };

  const handleAddressSelect = (selectedAddress) => {
    // Extract city, taluka, district, and state from display_name
    const addressComponents = selectedAddress.display_name.split(', ');
    const city = addressComponents[1];
    const taluka = addressComponents[1];
    const district = addressComponents[2];
    const state = addressComponents[3];
    const pincode = addressComponents[7];

    setFormData((prevFormData) => ({
      ...prevFormData,
      address: selectedAddress.display_name,
      village: city, // Assuming city as village, you may adjust this if needed
      taluka: taluka || '',
      district: district || '',
      state: state || '',
      pincode: pincode || '', // Reset pincode, as it's not provided by the API response
    }));

    setSuggestions([]);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result);
        if (typeof onPhotoCapture === 'function') {
          onPhotoCapture(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="onboarding-form-container">
      <ToastContainer />
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <ul>
          
          <li>
            <div className="title" onClick={toggleKYCCollapse}>
              <PersonOutlineIcon />
              <span className="bullet" style={{ color: getBulletColor() }}>&#8226;</span>

              <Link to="/kyc" className="sidebar-link">
                <span className="mains">KYC</span>
                <div className="detail-icons1">
                {isKYCCollapsed ? <ExpandMoreIcon/> : <ExpandLessIcon  />}
                </div>
              </Link>
            
              
            </div>
            
            <div className={`collapsible-content ${isKYCCollapsed ? 'collapsed' : ''}`}>
              <h2>{formType === "kyc" ? "KYC Form" : "Labour Onboarding Form"}</h2>
              <hr />
              <div className="form-body">
                {formType === "kyc" && (
                  <>
                    <div className="labour-adhaar">
                      <div className="labour-ownership">
                        <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                          Labour ownership {renderRequiredAsterisk(true)}
                        </InputLabel>
                        <div id="select-container">
                          <select
                            id="labourOwnership"
                            className="select-wrapper"
                            name="labourOwnership"
                            required
                            value={formData.labourOwnership || ''}
                            onChange={(e) => setFormData({ ...formData, labourOwnership: e.target.value })} >
                            <option value="VJ" style={{ width: 'calc(100% - 20px)' }}>VJ</option>
                            <option value="Contractor" style={{ width: 'calc(100% - 20px)' }}>Contractor</option>
                          </select>
                        </div>
                      </div>

                      <div className="project-field">
                        <InputLabel id="aadhaar-label" sx={{ color: "black" }}>
                          Upload Aadhaar{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <div className="input-with-icon">
                          <input type="file" onChange={handleFileChange} required />
                          <DocumentScannerIcon className="input-icon" />
                        </div>
                      </div>

                    </div>

                    <div className="name-contact">
                      <div className="name">
                        <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                          Name{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <input
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>


                      <div className="adharNumber">
                        <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                          Aadhaar Number {renderRequiredAsterisk(true)}
                        </InputLabel>
                        <div id="adhaar-input">
                          <input
                            value={formData.aadhaarNumber || ''}
                            onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                    </div>

                    <div className="birth-aadhaar">
                      <div className="date">
                        <div className="birth-date">
                          <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                            Date of Birth{renderRequiredAsterisk(true)}
                          </InputLabel>
                          <input
                            className="date-input"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => {
                              setDateOfBirth(e.target.value);
                              handleDateChange(e);
                            }}
                            max="2006-01-01"
                            required
                          />
                          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                        </div>
                      </div>



                      <div className="contact">
                        <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                          Contact number{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <input
                          value={formData.contactNumber || ''}
                          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                          required
                        />
                      </div>

                    </div>

                    <div className="gender">
                      <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                        Gender{renderRequiredAsterisk(true)}
                      </InputLabel>
                      <div className="gender-input">
                        <select
                          id="gender"
                          name="gender"
                          required
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                  </>
                )}
              </div>
            </div>

          </li>
         

          


          <li>
            <div className="title" onClick={togglePersonalCollapse}>
              <EditNoteIcon />
              <span className="bullet" style={{ color: getBulletColor() }}>&#8226;</span>

              <Link to="/personal" className="sidebar-link">
               
                <span className="mains">Personal</span>
                <div className="detail-icons2">
                {isPersonalCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </div>
              </Link>
           
            </div>
            <div className={`collapsible-content ${isPersonalCollapsed ? 'collapsed' : ''}`}>

              <div className="form-body">

                {formType === "personal" && (
                  <>
                    <div className="joining-date">
                      <InputLabel
                        id="demo-simple-select-label"
                        sx={{ color: "black" }}
                      >
                        Date of joining{renderRequiredAsterisk(true)}
                      </InputLabel>
                      <input
                        className="date-input"
                        type="date"
                        id="dateOfJoining"
                        name="dateOfJoining"
                        required
                        onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                        value={formData.dateOfJoining || ''}
                      />
                    </div>
                    <div className="locations">
                      <div className="location-address-label">
                        <InputLabel
                          id="demo-simple-select-label"
                          sx={{ color: "black" }}
                        >
                          Address{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <input
                          className="address"
                          type="text"
                          id="address"
                          name="address"
                          required
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          value={formData.address || ''}
                        />

                      </div>
                      <div className="personal-pincode-field">
                        <InputLabel
                          id="personal-pincode-label"
                          sx={{ color: "black" }}
                        >
                          Pincode{renderRequiredAsterisk(true)}
                        </InputLabel>

                        <input
                          type="text"
                          id="personal-pincode"
                          name="personal-pincode"
                          required
                          value={formData.pincode || ''}
                          onChange={handlePincodeChange}
                        />
                      </div>

                    </div>
                    <div className="locations">
                      <div className="location-taluka-label">
                        <InputLabel
                          id="demo-simple-select-label"
                          sx={{ color: "black" }}
                        >
                          Taluka{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <input
                          className="taluka"
                          type="text"
                          id="taluka"
                          name="taluka"
                          required
                          value={formData.taluka || ''}
                          onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                        />
                      </div>

                      <div className="location-district-label">
                        <InputLabel
                          id="demo-simple-select-label"
                          sx={{ color: "black" }}
                        >
                          District{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <input
                          className="district"
                          type="text"
                          id="district"
                          name="district"
                          required
                          value={formData.district || ''}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        />
                      </div>

                    </div>

                    <div className="state-block">
                      <div className="location-Village-label">
                        <InputLabel
                          id="demo-simple-select-label"
                          sx={{ color: "black" }}
                        >
                          Village/City{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <input
                          className="village"
                          type="text"
                          id="village" p
                          name="village"
                          required
                          value={formData.village || ''}
                          onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        />
                      </div>


                      <div className="location-state-label">
                        <InputLabel
                          id="demo-simple-select-label"
                          sx={{ color: "black" }}
                        >
                          State{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <input
                          className="state"
                          type="text"
                          id="state"
                          name="state"
                          required
                          value={formData.state || ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="em-contact-block">
                      <div className="personal-emcontact-field">
                        <InputLabel
                          id="personal-emcontact-label"
                          sx={{ color: "black" }}
                        >
                          Emergency Contact{renderRequiredAsterisk(true)}
                        </InputLabel>

                        <input
                          type="text"
                          id="personal-emcontact"
                          name="personal-emcontact"
                          required
                          value={formData.emergencyContact || ''}
                          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        />
                      </div>

                      <div className="location-photo-label">
                        <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                          Capture Photo
      </InputLabel>
                        <input
                          className="photo"
                          type="file"
                          id="photo"
                          name="photo"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoChange}
                          required
                        />
                        {photoData && (
                          <img src={photoData} alt="Captured Photo" style={{ maxWidth: "100%" }} className="capturePhoto" />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </li>


          <li>
            <div className="title" onClick={toggleBankDetailsCollapse}>
         
              <AccountBalanceIcon />
           <span className="bullet" style={{ color: getBulletColor() }}>&#8226;</span>
           <Link to="/bankDetails" className="sidebar-link">
           <span className="mains">BankDetails</span>
              <div className="detail-icons">
                {isBankDetailsCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </div> 
              </Link>
             
            </div>
            <div className={`collapsible-content ${isBankDetailsCollapsed ? 'collapsed' : ''}`}>
              <div className="form-body">
                {formType === "bankDetails" && (
                  <>
                    <div className="bankDetails-field">
                      <InputLabel id="bank-name-label" sx={{ color: "black" }}>
                        Bank Name{renderRequiredAsterisk(true)}
                      </InputLabel>
                      <input
                        type="text"
                        id="bankName"
                        name="bankName"
                        required
                        value={formData.bankName || ''}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      />
                    </div>

                    <div className="bankDetails-field">
                      <InputLabel id="branch-label" sx={{ color: "black" }}>
                        Branch{renderRequiredAsterisk(true)}
                      </InputLabel>
                      <input
                        type="text"
                        id="branch"
                        name="branch"
                        required
                        value={formData.branch || ''}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      />
                    </div>

                    <div className="bankDetails-field">
                      <InputLabel id="account-number-label" sx={{ color: "black" }}>
                        Account Number{renderRequiredAsterisk(true)}
                      </InputLabel>
                      <input
                        type="text"
                        id="accountNumber"
                        name="accountNumber"
                        required
                        value={formData.accountNumber || ''}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      />
                    </div>

                    <div className="bankDetails-field">
                      <InputLabel id="ifsc-label" sx={{ color: "black" }}>
                        IFSC code{renderRequiredAsterisk(true)}
                      </InputLabel>
                      <input
                        type="text"
                        id="ifsc"
                        name="ifsc"
                        required
                        value={formData.ifscCode || ''}
                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      />
                    </div>

                    <div className="bankDetails-field">
                      <InputLabel id="id-card-label" sx={{ color: "black" }}>
                        Id Card{renderRequiredAsterisk(true)}
                      </InputLabel>
                      <input type="file" onChange={() => { }} required />
                    </div>

                  </>
                )}
              </div>
            </div>
          </li>


          <li>
            <div className="title" onClick={toggleProjectCollapse}>
           

              <AssignmentIcon />
           <span className="bullet" style={{ color: getBulletColor(formStatus.project) }}>&#8226;</span>

           <Link to="/project" className="sidebar-link">
                <span className="mains">Project</span>
                <div className="detail-icons3">
                {isProjectCollapsed ? <ExpandMoreIcon  /> : <ExpandLessIcon />}
                </div>
              </Link>
             
            </div>
            <div className={`collapsible-content ${isProjectCollapsed ? 'collapsed' : ''}`}>
              <div className="form-body">
                {formType === "project" && (
                  <>
                  <div>
                    <div className="locations">
                      {formData.labourOwnership === "Contractor" && (
                        <div className="locations">
                          <div className="name">
                            <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                              Contractor Name{renderRequiredAsterisk(true)}
                            </InputLabel>
                            <input
                              value={formData.contractorName || ''}
                              onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                              required
                            />
                          </div>

                          <div className="contact">
                            <InputLabel id="demo-simple-select-label" sx={{ color: "black" }}>
                              Contractor number{renderRequiredAsterisk(true)}
                            </InputLabel>
                            <input
                              value={formData.contractorNumber || ''}
                              onChange={(e) => setFormData({ ...formData, contractorNumber: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="locations">
                      <div className="project-field">
                        <InputLabel id="project-name-label" sx={{ color: "black" }}>
                          Project Name{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <div className="gender-input">
                          <select id="projectName" name="projectName" required>
                            <option value="YashOne Infinitee">YashOne Infinitee</option>
                            <option value="New Test Project">New Test Project</option>
                          </select>
                        </div>
                      </div>

                      <div className="project-field">
                        <InputLabel id="labour-category-label" sx={{ color: "black" }}>
                          Labour Category{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <div className="gender-input">
                          <select id="labourCategory" name="labourCategory" required>
                            <option value="Skilled">Skilled</option>
                            <option value="Semi-Skilled">Semi-Skilled</option>
                            <option value="Unskilled">Unskilled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="locations">
                      <div className="project-field">
                        <InputLabel id="department-label" sx={{ color: "black" }}>
                          Department{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <div className="gender-input">
                          <select id="department" name="department" required>
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="CCA">CCA</option>
                            <option value="EHCS">EHCS</option>
                            <option value="Firefighting">Firefighting</option>
                            <option value="MQC">MQC</option>
                            <option value="FEP">FEP</option>
                            <option value="E&C">E&C</option>
                          </select>
                        </div>
                      </div>

                      <div className="project-field">
                        <InputLabel id="working-hours-label" sx={{ color: "black" }}>
                          Working Hours{renderRequiredAsterisk(true)}
                        </InputLabel>
                        <div className="gender-input">
                          <select id="workingHours" name="workingHours" required>
                            <option value="8 hours">8 hours</option>
                            <option value="9 hours">9 hours</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="save-btn">
            <button type="submit" id="save" className="save-button" onClick={handleSubmit}>Save details</button>
          </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </li>
         
        </ul>

      </form>
    </div>
  );
};


export default OnboardingForm;
