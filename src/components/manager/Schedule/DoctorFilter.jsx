import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import './DoctorFilter.css';

const DoctorFilter = ({ selectedDoctor, onDoctorChange, doctors = [] }) => {
    return (
        <div className="doctor-filter">
            <InputGroup>
                <InputGroup.Text>
                    <i className="fas fa-user-md"></i>
                </InputGroup.Text>
                <Form.Select 
                    value={selectedDoctor || ''}
                    onChange={(e) => onDoctorChange(e.target.value)}
                    className="doctor-select"
                >
                    <option value="">Tất cả bác sĩ</option>
                    {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialty}
                        </option>
                    ))}
                </Form.Select>
            </InputGroup>
        </div>
    );
};

export default DoctorFilter;
