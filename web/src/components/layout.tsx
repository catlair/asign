import { For } from 'solid-js'

function MenuSvg() {
  return (
    <svg
      class='w-6 h-6'
      aria-hidden='true'
      fill='currentColor'
      viewBox='0 0 20 20'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        clip-rule='evenodd'
        fill-rule='evenodd'
        d='M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z'
      >
      </path>
    </svg>
  )
}

function SidebarItem() {
  return (
    <li>
      <a
        href='#'
        class='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group'
      >
        <svg
          class='w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
          aria-hidden='true'
          xmlns='http://www.w3.org/2000/svg'
          fill='currentColor'
          viewBox='0 0 22 21'
        >
          <path d='M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z' />
          <path d='M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z' />
        </svg>
        <span class='ms-3'>用户管理</span>
      </a>
    </li>
  )
}

export function Layout() {
  return (
    <div>
      <button
        data-drawer-target='default-sidebar'
        data-drawer-toggle='default-sidebar'
        aria-controls='default-sidebar'
        type='button'
        class='inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
      >
        <span class='sr-only'>Open sidebar</span>
        <MenuSvg />
      </button>

      <nav class='fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700'>
        <div class='px-3 py-3 lg:px-5 lg:pl-3'>
          <div class='flex items-center justify-between'>
            <div class='flex items-center justify-start rtl:justify-end'>
              <button
                data-drawer-target='logo-sidebar'
                data-drawer-toggle='logo-sidebar'
                aria-controls='logo-sidebar'
                type='button'
                class='inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
              >
                <span class='sr-only'>Open sidebar</span>
                <svg
                  class='w-6 h-6'
                  aria-hidden='true'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    clip-rule='evenodd'
                    fill-rule='evenodd'
                    d='M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z'
                  >
                  </path>
                </svg>
              </button>
              <a href='https://flowbite.com' class='flex ms-2 md:me-24'>
                <img
                  src='https://flowbite.com/docs/images/logo.svg'
                  class='h-8 me-3'
                  alt='FlowBite Logo'
                />
                <span class='self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white'>
                  Flowbite
                </span>
              </a>
            </div>
            <div class='flex items-center'>
              <div class='flex items-center ms-3'>
                <div>
                  <button
                    type='button'
                    class='flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600'
                    aria-expanded='false'
                    data-dropdown-toggle='dropdown-user'
                  >
                    <span class='sr-only'>Open user menu</span>
                    <img
                      class='w-8 h-8 rounded-full'
                      src='https://flowbite.com/docs/images/people/profile-picture-5.jpg'
                      alt='user photo'
                    />
                  </button>
                </div>
                <div
                  class='z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600'
                  id='dropdown-user'
                >
                  <div class='px-4 py-3' role='none'>
                    <p
                      class='text-sm text-gray-900 dark:text-white'
                      role='none'
                    >
                      Neil Sims
                    </p>
                    <p
                      class='text-sm font-medium text-gray-900 truncate dark:text-gray-300'
                      role='none'
                    >
                      neil.sims@flowbite.com
                    </p>
                  </div>
                  <ul class='py-1' role='none'>
                    <li>
                      <a
                        href='#'
                        class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
                        role='menuitem'
                      >
                        Dashboard
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
                        role='menuitem'
                      >
                        Settings
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
                        role='menuitem'
                      >
                        Earnings
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
                        role='menuitem'
                      >
                        Sign out
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <aside
        id='logo-sidebar'
        class='fixed top-0 left-0 z-40 w-64 h-screen pt-12 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700'
        aria-label='Sidebar'
      >
        <div class='h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800'>
          <ul class='space-y-2 font-medium'>
            <For each={[1]}>{() => <SidebarItem />}</For>
          </ul>
        </div>
      </aside>

      <main class='p-4 sm:ml-64'>
        <div class='p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14'>
          <div class='grid grid-cols-3 gap-4 mb-4'>
            <div class='flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div class='flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div class='flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
          </div>
          <div class='flex items-center justify-center h-48 mb-4 rounded bg-gray-50 dark:bg-gray-800'>
            <p class='text-2xl text-gray-400 dark:text-gray-500'>
              <svg
                class='w-3.5 h-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 18 18'
              >
                <path
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M9 1v16M1 9h16'
                />
              </svg>
            </p>
          </div>
          <div class='grid grid-cols-2 gap-4 mb-4'>
            <div class='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div class='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div class='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div class='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
          </div>
          <div class='flex items-center justify-center h-48 mb-4 rounded bg-gray-50 dark:bg-gray-800'>
            <p class='text-2xl text-gray-400 dark:text-gray-500'>
              <svg
                class='w-3.5 h-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 18 18'
              >
                <path
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M9 1v16M1 9h16'
                />
              </svg>
            </p>
          </div>
          <div class='grid grid-cols-2 gap-4'>
            <div class='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div class='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div class='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div class='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p class='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  class='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
