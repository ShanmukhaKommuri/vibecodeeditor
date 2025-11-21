import React from 'react'
import Image from 'next/image'
import SignInFormClient from '@/modules/auth/components/sign-in-form-client'
// import login from '@/public/login.svg'
const Page = () => {
  return (
    <>
      <Image src={"/login.svg"} alt="login image" width={300} height={300} />
      <SignInFormClient />
    </>
  )
}

export default Page
