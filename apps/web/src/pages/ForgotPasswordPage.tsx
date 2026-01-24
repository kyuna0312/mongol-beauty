import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { FORGOT_PASSWORD } from '../graphql/mutations';
import { Button, Input } from '@mongol-beauty/ui';
import { Mail, CheckCircle } from 'lucide-react';
import { InlineError } from '../components/InlineError';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      await forgotPassword({ variables: { email } });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Алдаа гарлаа');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-beige-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">Нууц үг сэргээх</h1>
          <p className="text-gray-600">Имэйл хаягаа оруулна уу</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-primary-100">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Имэйл илгээгдлээ</h2>
              <p className="text-gray-600 mb-6">
                Хэрэв {email} хаяг бүртгэлтэй бол нууц үг сэргээх холбоос илгээгдсэн байна.
              </p>
              <Link to="/login">
                <Button variant="primary" fullWidth>
                  Нэвтрэх хуудас руу буцах
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <InlineError
                  message={error}
                  title="Нууц үг сэргээхэд алдаа гарлаа"
                  showRem={true}
                />
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Имэйл хаяг
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Илгээж байна...' : 'Илгээх'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
              Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
