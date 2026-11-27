import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, Package, RefreshCw, Plus, Pencil, Trash2, X,
  Wifi, WifiOff, Database, ExternalLink
} from 'lucide-react';
import {
  fetchExternalProducts,
  createProduct,
  replaceProduct,
  deleteProduct
} from './api';
import './style.css';

const sample = [
  {id:'demo-01', titulo:'Teclado Mecânico', descricao:'Teclado compacto para produtividade e jogos.', preco:249.9},
  {id:'demo-02', titulo:'Mouse Sem Fio', descricao:'Mouse ergonômico com conexão wireless.', preco:119.9},
  {id:'demo-03', titulo:'Headset Gamer', descricao:'Headset com microfone e som estéreo.', preco:189.9},
  {id:'demo-04', titulo:'Monitor 24 polegadas', descricao:'Monitor Full HD para trabalho e entretenimento.', preco:799.9},
];

const money = (n) => Number(n || 0).toLocaleString('pt-BR', {
  style:'currency',
  currency:'BRL'
});

function App(){
  const [products,setProducts]=useState(sample);
  const [search,setSearch]=useState('');
  const [source,setSource]=useState('demo');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({title:'',description:'',price:''});
  const [external,setExternal]=useState([]);

  const filtered=useMemo(
    ()=>products.filter(p=>`${p.title||p.titulo||''} ${p.description||p.descricao||''}`.toLowerCase().includes(search.toLowerCase())),
    [products,search]
  );

  async function loadFirestore(){
    setBusy(true);
    setError('');

    try{
      const list=await fetchExternalProducts();
      setProducts(list);
      setSource('api');
    }catch(e){
      setError('Erro ao carregar produtos da API: '+e.message);
    }finally{
      setBusy(false);
    }
  }

  useEffect(()=>{
    loadFirestore();
  },[]);

  async function loadApi(){
    setBusy(true);
    setError('');

    try{
      const list=await fetchExternalProducts();
      setExternal(list);
      setError('Consulta GET concluída. Dados recebidos da API.');
    }catch(e){
      setError(e.message);
    }finally{
      setBusy(false);
    }
  }

  function openNew(){
    setEditing(null);
    setForm({title:'',description:'',price:''});
    setModal(true);
  }

  function openEdit(p){
    setEditing(p);
    setForm({
      title:p.title||p.titulo||'',
      description:p.description||p.descricao||'',
      price:p.price??p.preco??''
    });
    setModal(true);
  }

  async function save(e){
    e.preventDefault();

    const item={
      titulo:form.title.trim(),
      descricao:form.description.trim(),
      preco:Number(form.price)
    };

    if(!item.titulo||!Number.isFinite(item.preco)||item.preco<0){
      return;
    }

    setBusy(true);
    setError('');

    try{
      if(editing){
        await replaceProduct(editing.id,item);
      }else{
        await createProduct(item);
      }

      await loadFirestore();
      setModal(false);
      setError(editing?'Produto atualizado na API.':'Produto cadastrado na API.');
    }catch(err){
      setError('Erro ao salvar: '+err.message);
    }finally{
      setBusy(false);
    }
  }

  async function remove(p){
    if(!confirm(`Excluir ${p.title||p.titulo}?`))return;

    setBusy(true);
    setError('');

    try{
      await deleteProduct(p.id);
      await loadFirestore();
      setError('Produto excluído da API.');
    }catch(e){
      setError('Erro ao excluir: '+e.message);
    }finally{
      setBusy(false);
    }
  }

  return <div className="app">
    <header className="top">
      <div className="brand">
        <div className="logo"><Package size={22}/></div>
        <div>
          <strong>TechList</strong>
          <small>CATÁLOGO DIGITAL</small>
        </div>
      </div>

      <div className="connection">
        {source==='api'
          ? <><Wifi size={16}/> API conectada</>
          : <><WifiOff size={16}/> Modo demonstração</>}
      </div>
    </header>

    <main>
      <section className="hero">
        <div className="eyebrow">GESTÃO DE PRODUTOS</div>
        <h1>Seu catálogo,<br/><span>simples e organizado.</span></h1>
        <p>Consulte, pesquise e gerencie produtos em uma interface prática.</p>

        <div className="heroBtns">
          <button className="primary" onClick={openNew}>
            <Plus size={18}/> Novo produto
          </button>
          <button className="secondary" onClick={loadFirestore}>
            <RefreshCw size={16}/> Atualizar lista
          </button>
        </div>
      </section>

      <section className="stats">
        <div>
          <span>Produtos exibidos</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Fonte de dados</span>
          <strong>{source==='api'?'API Technoworks':'Demonstração'}</strong>
        </div>
        <div>
          <span>Arquitetura</span>
          <strong>REST / JSON</strong>
        </div>
      </section>

      <section className="catalog">
        <div className="catalogTitle">
          <div>
            <h2>Catálogo de produtos</h2>
            <p>Pesquise e gerencie os itens cadastrados.</p>
          </div>

          <div className="search">
            <Search size={17}/>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar produto..."
            />
          </div>
        </div>

        {error&&<div className="notice">{error}</div>}
        {busy&&<p className="loading">Carregando...</p>}

        {filtered.length===0&&!busy
          ? <div className="empty">Nenhum produto encontrado.</div>
          : <div className="cards">
              {filtered.map(p=><article className="product" key={p.id}>
                <div className="productIcon"><Package/></div>

                <div className="prodContent">
                  <div className="prodTop">
                    <h3>{p.title||p.titulo||'Produto'}</h3>
                    <span className="tag">Produto</span>
                  </div>

                  <p>{p.description||p.descricao||'Sem descrição.'}</p>

                  <strong className="price">{money(p.price??p.preco)}</strong>
                  <small className="id">ID: {p.id}</small>

                  <div className="actions">
                    <button onClick={()=>openEdit(p)}>
                      <Pencil size={15}/> Editar
                    </button>
                    <button className="danger" onClick={()=>remove(p)}>
                      <Trash2 size={15}/> Excluir
                    </button>
                  </div>
                </div>
              </article>)}
            </div>
        }
      </section>

      <section className="apiBox">
        <div className="apiHeader">
          <div className="apiIcon"><ExternalLink/></div>
          <div>
            <h2>Consulta à API externa</h2>
            <p>Integração de dados via requisição GET.</p>
          </div>
        </div>

        <button className="secondary" onClick={loadApi} disabled={busy}>
          <RefreshCw size={16}/> Consultar API
        </button>

        {external.length>0&&<div className="external">
          <h3>Resposta da API ({external.length} registros)</h3>
          {external.map((p,i)=><pre key={i}>{JSON.stringify(p,null,2)}</pre>)}
        </div>}
      </section>

      <section className="tech">
        <h2>Sobre o projeto</h2>

        <div className="techGrid">
          <div><Database/><strong>Banco NoSQL</strong><span>Firestore</span></div>
          <div><ExternalLink/><strong>API REST</strong><span>Dados em JSON</span></div>
          <div><Wifi/><strong>Web Service</strong><span>Acesso via navegador</span></div>
        </div>

        <p className="footnote">
          Projeto acadêmico de Sistemas Distribuídos.
          Integração com a API REST Technoworks.
        </p>
      </section>
    </main>

    <footer>TechList · Projeto acadêmico de Sistemas Distribuídos</footer>

    {modal&&<div className="overlay" onClick={()=>setModal(false)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modalHead">
          <h2>{editing?'Editar produto':'Novo produto'}</h2>
          <button className="iconBtn" onClick={()=>setModal(false)}><X/></button>
        </div>

        <form onSubmit={save}>
          <label>
            Nome do produto
            <input
              required
              value={form.title}
              onChange={e=>setForm({...form,title:e.target.value})}
              placeholder="Ex.: Teclado mecânico"
            />
          </label>

          <label>
            Descrição
            <textarea
              value={form.description}
              onChange={e=>setForm({...form,description:e.target.value})}
              placeholder="Descrição do produto"
              rows="3"
            />
          </label>

          <label>
            Preço (R$)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e=>setForm({...form,price:e.target.value})}
              placeholder="0.00"
            />
          </label>

          <div className="formBtns">
            <button type="button" className="secondary" onClick={()=>setModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="primary">
              Salvar produto
            </button>
          </div>
        </form>
      </div>
    </div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);