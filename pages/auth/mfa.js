import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../../styles/Home.module.css'
import { useRouter } from 'next/router'
import { useState } from 'react'
import cookie from "js-cookie";

async function tryAuth(code)
{
  const res = await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ code }) })
  const json = await res.json()
  switch(json.type) {
    case 'error':
      return alert(json.message)
    case 'multifactor':
      alert(json.message)
      window.location.replace(res.headers.get('Location'));
      return
    case 'auth':
      return alert(json.message)
    case 'response':  
      alert("Authentication is successful. You may now close this window.")
      cookie.remove('tdid')
      cookie.remove('clid')
      cookie.remove('asid')
      cookie.remove('region')
      cookie.remove('mfa_email')
      cookie.remove('id')
      window.location.replace('/');
      return true
    default:
      return alert(json.message)
  }
}

export default function Auth() {
  const [code, setCode] = useState('');
  const [idle, setIdle] = useState(true);

  if (cookie.get('tdid') === undefined)
  {
      return ("?");
  }
  const btnLogin_click = (self) => {
    if (self.target.disabled) return;
    document.getElementById('idleView').style.display = 'none'
    document.getElementById('processingView').style.display = 'block'
    self.target.disabled = true
    tryAuth(code).then((x) => {
        if (x)
        {
          return;
        }
        self.target.disabled = false
        setIdle(true)
        document.getElementById('processingView').style.display = 'none'
        document.getElementById('idleView').style.display = 'block'
    });
  }
  return (
    <div className={styles.container, 'bg-main_bg'}>
      <Head>
        <title>vTools Authenticator</title>
        <meta name="description" content="vTools(Valorant Tools)"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/assets/favicon.ico" />  
      </Head>

      <main className={styles.main}>
        <div className='container p-2'>
          <div className='lg:w-1/2 xl:w-1/4 2xl:w1/6 md:w-full lg:mx-auto md:mx-auto border flex flex-col border-white p-10 rounded-md bg-input_bg'>
              <Image src='/images/vToolsLogo.png' className='object-contain' alt='logo' width={64} height={64}/>
              <h1 className={styles.subtitle}>
                <Link href="/">vTools</Link> Authenticator
              </h1>
              <div className="flex-grow border-t border-white mt-5 mb-3"></div>
                <p className='text-white text-sm'>Riot sent a code to your email <strong>{cookie.get('mfa_email')}</strong> to confirm your Authentication.</p>
              <form method='post' className='mt-6 flex flex-col'>
                <input type='text' name='code' placeholder='Authentication Code' className="relative focus:border-cream text-white w-full block px-3 py-2 border bg-border_bg border-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-black-500 focus:border-black-500 focus:z-10 sm:text-sm" required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}/>
              </form>
                <em className='text-white text-sm mt-3'>Note: If you are doubting us, kindly check this page{'\''}s source by clicking the Github icon below.</em> 
                <div className="flex-grow border-t border-white mt-3 mb-3"></div>
                <button value='Login' className={`relative ${idle ? "cursor-pointer hover:bg-main_bg !hover:text-black" : "cursor-default !bg-main_bg"} text-white w-full px-3 py-2 border bg-border_bg border-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-black-500 focus:border-black-500 focus:z-10 sm:text-sm`}
                onClick={(self) => {btnLogin_click(self); setIdle(false);}}>
                    <span id="processingView" style={{display: 'none'}}><svg className="animate-spin ease duration-300 border-2 border-white w-3 inline" viewBox='0 0 24 24'></svg> Processing...</span>
                    <span id="idleView" style={{display: 'block'}}>Submit</span>
                </button>
          </div>

        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://discord.gg/ME5EdK8U9v"
          target="_blank"
          rel="noopener noreferrer"
          className='text-white' >
          Join Us!{' '}
          <span className={styles.logo}>
            <Image src="/assets/discord.svg" alt="Discord Logo" width={20} height={20}/>
          </span>
        </a>
        <a href="https://github.com/weedeej/vtools-next"
          target="_blank"
          rel="noopener noreferrer"
          className='text-white' >
          Source{' '}
          <span className={styles.logo}>
            <Image src="/assets/github.svg" alt="Github Logo" width={20} height={20}/>
          </span>
        </a>
      </footer>
    </div>
  )
}
