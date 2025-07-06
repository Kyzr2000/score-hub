import './App.css';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload, Button } from 'antd';
import { useState } from 'react';
import axios from 'axios';

const { Dragger } = Upload;

function App() {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const props = {
    name: 'files', // 注意这里要与后端一致
    multiple: true,
    beforeUpload: () => {
      return false; // 阻止自动上传
    },
    onChange(info) {
      console.log('文件变更:', info.fileList);
      setFileList(info.fileList);
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const handleAnalyze = async () => {
    if (fileList.length === 0) {
      message.warning('请先上传文件');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      // 遍历文件列表并添加到 FormData
      fileList.forEach((file) => {
        formData.append('files', file.originFileObj); // 确保这里的 'files' 与后端一致
      });

      const response = await axios.post('http://47.96.138.241:8080/merge-grades', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // 关键部分，确保返回 Blob 数据
      });

      // 获取文件名
      const contentDisposition = response.headers['content-disposition'];
      let filename = '分析结果.xlsx'; // 默认文件名

      if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
        const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, ''); // 清理引号
        }
      }

      // 创建 Blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // 创建并自动点击下载链接
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // 设置下载文件名
      document.body.appendChild(link);
      link.click();

      // 清理
      link.remove();
      window.URL.revokeObjectURL(url); // 释放 Blob URL

      message.success('文件下载成功');
    } catch (error) {
      console.error(error);
      message.error('分析失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#ff9',
        height: '90vh',
        width: '80vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}>
      <div style={{ width: '70%', height: '30%' }}>
        <Dragger {...props} fileList={fileList}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">上传文件</p>
          <p className="ant-upload-hint">
            点击或者拖拽文件到此处即可上传文件（支持多个文件的上传）
          </p>
        </Dragger>

        <Button
          style={{ width: '100%', marginTop: 50 }}
          type="primary"
          onClick={handleAnalyze}
          loading={loading}
          disabled={loading}>
          {loading ? '分析中...' : '开始分析'}
        </Button>
      </div>
    </div>
  );
}

export default App;
