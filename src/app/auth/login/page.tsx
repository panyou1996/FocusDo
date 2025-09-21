'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Chrome, Github } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Icons } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, user, loading } = useAuth();

  // 如果已经登录，直接跳转
  useEffect(() => {
    if (!loading && user) {
      router.push('/my-day');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "请填写完整信息",
        description: "请输入邮箱和密码",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }

      if (data?.user) {
        toast({
          title: "登录成功",
          description: "欢迎回到 AquaDo！"
        });
        
        router.push('/my-day');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = '登录失败，请检查您的邮箱和密码';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = '邮箱或密码错误';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = '请先验证您的邮箱';
      }
      
      toast({
        title: "登录失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: "功能开发中",
      description: `${provider} 登录功能正在开发中...`
    });
  };

  // 加载中显示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="flex items-center gap-2">
                <Icons.logo className="size-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AquaDo
                </span>
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">欢迎回来</CardTitle>
              <CardDescription className="text-gray-600">
                登录您的账户以继续使用智能任务管理
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  邮箱地址
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入您的邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "登录"
                )}
              </Button>
            </form>
            
            <div className="relative">
              <Separator className="my-4" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                或者使用
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('微信')}
                className="h-11 border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              >
                <Chrome className="w-4 h-4 mr-2" />
                微信登录
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('GitHub')}
                className="h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="text-center text-sm text-gray-600">
            <p>
              还没有账户？{' '}
              <Link 
                href="/auth/register" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                立即注册
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-500 mt-8"
        >
          登录即表示您同意我们的{' '}
          <a href="#" className="hover:text-gray-700 transition-colors">服务条款</a>
          {' '}和{' '}
          <a href="#" className="hover:text-gray-700 transition-colors">隐私政策</a>
        </motion.p>
      </motion.div>
    </div>
  );
}