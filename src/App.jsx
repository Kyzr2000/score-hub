import './App.css'
import { InboxOutlined } from '@ant-design/icons'
import { message, Upload, Button } from 'antd'
import { useState } from 'react'

const { Dragger } = Upload

function App() {
  // 存储上传的文件列表
  const [fileList, setFileList] = useState([])
  // 控制按钮 loading 状态
  const [loading, setLoading] = useState(false)

  const props = {
    name: 'file',
    multiple: true,
    beforeUpload: () => {
      // 阻止自动上传
      return false
    },
    onChange(info) {
      console.log('文件变更:', info.fileList)
      setFileList(info.fileList)
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    },
  }

  const handleAnalyze = async () => {
    if (fileList.length === 0) {
      message.warning('请先上传文件')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      fileList.forEach((file) => {
        formData.append('files', file.originFileObj)
      })

      // 模拟调用分析接口（你可以替换成真实接口）
      const response = await fetch(
        'https://660d2bd96ddfa2943b33731c.mockapi.io/api/analyze',
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) throw new Error('分析失败')

      const result = await response.json()
      console.log('分析结果:', result)
      message.success('分析完成')
    } catch (error) {
      console.error(error)
      message.error('分析失败')
    } finally {
      setLoading(false)
    }
  }

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
  )
}

export default App
