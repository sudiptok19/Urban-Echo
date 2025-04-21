import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        userType: 'citizen',
        authorityId: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Basic validation
            if (formData.password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            if (!formData.name.trim()) {
                throw new Error('Name is required');
            }

            // For authority users, verify authority ID first
            if (formData.userType === 'authority') {
                const { data: authorityData, error: authorityError } = await supabase
                    .from('authority_ids')
                    .select()
                    .eq('id', formData.authorityId)
                    .eq('is_active', true)
                    .is('used_by', null)
                    .maybeSingle();

                if (authorityError || !authorityData) {
                    throw new Error('Invalid or inactive authority ID');
                }
            }

            // Create user using supabase.auth.signUp
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name.trim(),
                        user_type: formData.userType, // must be 'authority' for admins
                    }
                }
            });

            if (authError) {
                console.error('Supabase auth.signUp error:', authError);
                setError(`Signup failed: ${authError.message}`);
                return;
            }

            if (!authData?.user) {
                throw new Error('User creation failed');
            }

            const user = authData.user;

            // For authority users, update authority_ids table
            if (formData.userType === 'authority') {
                console.log('Updating authority_id:', formData.authorityId, 'with user id:', user.id);
                const { error: updateError } = await supabase
                    .from('authority_ids')
                    .update({
                        is_active: false,
                        used_by: user.id
                    })
                    .eq('id', formData.authorityId);

                if (updateError) {
                    console.error('Error updating authority ID:', updateError);
                    throw new Error('Failed to update authority ID status: ' + (updateError.message || JSON.stringify(updateError)));
                }
            }

            // Send confirmation email
            const { error: emailError } = await supabase.auth.resend({
                type: 'email',
                email: formData.email,
            });

            if (emailError) {
                console.error('Error sending confirmation email:', emailError);
                setError('Failed to send confirmation email. Please try again.');
            }

            // Show success message and redirect
            alert('Account created! Please check your email to confirm your registration.');

            navigate('/login');

        } catch (error) {
            console.error('Error signing up:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <>
            <nav className="bg-blue-600 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Urban Echo</h1>
                    <Link to="/login" className="px-4 py-2 rounded hover:bg-blue-700">Login</Link>
                </div>
            </nav>

            <main className="container mx-auto max-w-md mt-10 p-6 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                            >
                                {showPassword ? (
                                    <i className="fas fa-eye-slash"></i>
                                ) : (
                                    <i className="fas fa-eye"></i>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Type</label>
                        <select
                            value={formData.userType}
                            onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="citizen">Citizen</option>
                            <option value="authority">Authority</option>
                        </select>
                    </div>

                    {formData.userType === 'authority' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Authority ID</label>
                            <input
                                type="text"
                                required
                                value={formData.authorityId}
                                onChange={(e) => setFormData({ ...formData, authorityId: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="Enter your authority ID"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
            </main>
        </>
    );
};

export default SignUp;
