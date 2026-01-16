Rails.application.routes.draw do
  devise_for :users, path: 'auth', controllers: {
    sessions: 'auth/sessions',
    registrations: 'auth/registrations'
  }

  namespace :api do
    namespace :v1 do
      resource :user, only: [:show, :update]
      resources :tracks
      resources :jobs, only: [:index, :show] do
        resources :proposals, only: [:index, :create]
      end
      resources :proposals, only: [:show, :update] do
        member do
          delete :withdraw
        end
        collection do
          get :my
        end
      end
      resources :conversations, only: [:index, :show, :create] do
        resources :messages, only: [:create]
      end
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
