import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { streamSeo } from './api';
import type { SeoResult } from './types';

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function App(): JSX.Element {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [keywordsRaw, setKeywordsRaw] = useState('');
  const [streamText, setStreamText] = useState('');
  const [result, setResult] = useState<SeoResult | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setStatus('loading');
    setError('');
    setResult(null);
    setStreamText('');

    const keywords = keywordsRaw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!keywords.length) {
      setStatus('error');
      setError('Введите хотя бы одно ключевое слово');
      return;
    }

    try {
      await streamSeo(
        {
          input: {
            product_name: productName.trim(),
            category: category.trim(),
            keywords,
          },
        },
        {
          onToken: (token) => setStreamText((prev) => prev + token),
          onDone: (data) => {
            setResult(data);
            setStatus('done');
          },
          onFallback: (data, reason) => {
            setResult(data);
            setError(reason ?? 'Использован fallback-ответ');
            setStatus('done');
          },
        },
      );
    } catch (requestError) {
      setStatus('error');
      setError(requestError instanceof Error ? requestError.message : 'Ошибка запроса');
    }
  };

  return (
    <main className="container">
      <header className="brand card">
        <img className="brand-logo" src="/marpla-logo.png" alt="MarPla" />
        <div>
          <h1>MarPla SEO Product Description Generator</h1>
          <p className="muted">Демо-версия для проверки заказчиком (NestJS + Flowise-ready + TWA)</p>
        </div>
      </header>

      <form className="card" onSubmit={onSubmit}>
        <label>
          Название товара
          <input value={productName} onChange={(e) => setProductName(e.target.value)} required />
        </label>

        <label>
          Категория
          <input value={category} onChange={(e) => setCategory(e.target.value)} required />
        </label>

        <label>
          Ключевые слова (через запятую)
          <textarea value={keywordsRaw} onChange={(e) => setKeywordsRaw(e.target.value)} required />
        </label>

        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Генерируем...' : 'Сгенерировать SEO'}
        </button>
      </form>

      {!!streamText && (
        <section className="card">
          <h2>Поток от LLM</h2>
          <pre>{streamText}</pre>
        </section>
      )}

      {result && (
        <section className="card">
          <h2>Результат</h2>
          <p>
            <strong>Title:</strong> {result.title}
          </p>
          <p>
            <strong>Meta:</strong> {result.meta_description}
          </p>
          <p>
            <strong>H1:</strong> {result.h1}
          </p>
          <p>
            <strong>Description:</strong> {result.description}
          </p>
          <ul>
            {result.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {!!error && <p className="error">{error}</p>}
    </main>
  );
}
