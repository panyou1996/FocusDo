'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useSupabaseSync } from '@/hooks/use-supabase-sync';
import { CheckCircle, XCircle, Loader2, Database, Cloud, User } from 'lucide-react';

export function SupabaseConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    connection: boolean | null;
    auth: boolean | null;
    database: boolean | null;
  }>({
    connection: null,
    auth: null,
    database: null,
  });

  const { user } = useAuth();
  const { syncToCloud } = useSupabaseSync();

  const testConnection = async () => {
    setTesting(true);
    setResults({ connection: null, auth: null, database: null });

    try {
      // 测试基本连接
      const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        setResults(prev => ({ ...prev, connection: false }));
        console.error('Connection test failed:', error);
      } else {
        setResults(prev => ({ ...prev, connection: true }));
      }

      // 测试认证
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setResults(prev => ({ ...prev, auth: !!authUser }));

      // 测试数据库操作（如果用户已登录）
      if (authUser) {
        const { error: dbError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', authUser.id)
          .single();
        
        setResults(prev => ({ ...prev, database: !dbError }));
      } else {
        setResults(prev => ({ ...prev, database: false }));
      }

    } catch (error) {
      console.error('Test failed:', error);
      setResults({ connection: false, auth: false, database: false });
    } finally {
      setTesting(false);
    }
  };

  const testSync = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    setTesting(true);
    try {
      const result = await syncToCloud([], [], []);
      if (result.success) {
        alert('同步测试成功！');
      } else {
        alert('同步测试失败：' + result.error);
      }
    } catch (error) {
      alert('同步测试失败：' + error);
    } finally {
      setTesting(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="w-5 h-5 bg-gray-200 rounded-full" />;
    return status ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase 连接测试
        </CardTitle>
        <CardDescription>
          测试与 Supabase 数据库的连接状态
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              数据库连接
            </span>
            <StatusIcon status={results.connection} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              用户认证
            </span>
            <StatusIcon status={results.auth} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Cloud className="w-4 w-4" />
              数据库读写
            </span>
            <StatusIcon status={results.database} />
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            测试连接
          </Button>

          {user && (
            <Button 
              onClick={testSync} 
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4 mr-2" />
              )}
              测试同步
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>当前用户: {user ? user.email : '未登录'}</p>
          <p>Supabase URL: https://xgprwlwqexlymjpxjsuf.supabase.co</p>
        </div>
      </CardContent>
    </Card>
  );
}