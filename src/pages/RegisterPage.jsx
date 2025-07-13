import React, { useActionState, useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';

function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
}

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setConfirmPassword] = useState(false);
const [errors, setErrors] = usetstate({});
const [isSubmitting, setIsSubmitting] = useState(false);

const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
        newErrors.firstName = "Ad alanı zorunludur.";
    }

    if (!formData.lastName.trim()) {
        newErrors.lastName = "Soyad alanı zorunludur.";
    }

    if (!formData.email.trim()) {
        newErrors.email = "E-mail alanı zorunludur";
    } else if (!/\)
}