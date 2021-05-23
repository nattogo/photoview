import { gql } from '@apollo/client'
import PropTypes from 'prop-types'
import React from 'react'
import { Helmet } from 'react-helmet'
import Header from '../header/Header'
import { Authorized } from '../routes/AuthorizedRoute'
import { SidebarProvider } from '../sidebar/Sidebar'
import MainMenu from './MainMenu'

export const ADMIN_QUERY = gql`
  query adminQuery {
    myUser {
      admin
    }
  }
`

type LayoutProps = {
  children: React.ReactNode
  title: string
}

const Layout = ({ children, title, ...otherProps }: LayoutProps) => {
  return (
    <SidebarProvider>
      <Helmet>
        <title>{title ? `${title} - Photoview` : `Photoview`}</title>
      </Helmet>
      <div
        className="h-full flex flex-col overflow-hidden relative"
        {...otherProps}
        data-testid="Layout"
      >
        <Header />
        <div className="lg:flex">
          <Authorized>
            <MainMenu />
          </Authorized>
          <div
            className="px-3 py-3 w-full overflow-y-scroll h-screen flex-grow lg:pt-5 lg:pl-0 lg:pr-8"
            id="layout-content"
          >
            {children}
            <div className="h-6"></div>
          </div>
        </div>
        {/* <Sidebar /> */}
      </div>
    </SidebarProvider>
  )
}

Layout.propTypes = {
  children: PropTypes.any.isRequired,
  title: PropTypes.string,
}

export default Layout