<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .container {
    background: white;
    border-radius: 15px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    max-width: 600px;
    width: 100%;
    animation: slideUp 0.6s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header {
    text-align: center;
    margin-bottom: 30px;
  }

  .header h1 {
    color: #333;
    font-size: 2.2rem;
    margin-bottom: 10px;
    font-weight: 300;
  }

  .header p {
    color: #666;
    font-size: 1.1rem;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    transition: border-color 0.3s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #667eea;
  }

  .submit-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  .result {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .validation-results {
    display: none;
  }

  .validation-results.show {
    display: block;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin: 15px 0;
  }

  .score-item {
    text-align: center;
    padding: 15px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .score-value {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .score-label {
    font-size: 0.9rem;
    color: #666;
  }

  .status-message {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
  }

  .status-message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .status-message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
</style>
