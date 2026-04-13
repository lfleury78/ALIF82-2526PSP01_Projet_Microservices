import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="bg-gray-100 border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase mb-3">Assistance</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><a href="#" class="hover:text-gray-900">Centre d'aide</a></li>
              <li><a href="#" class="hover:text-gray-900">Informations de sécurité</a></li>
              <li><a href="#" class="hover:text-gray-900">Options d'annulation</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase mb-3">Communauté</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><a href="#" class="hover:text-gray-900">Forum communautaire</a></li>
              <li><a href="#" class="hover:text-gray-900">Mettre en location</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase mb-3">À propos</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><a href="#" class="hover:text-gray-900">Conditions générales</a></li>
              <li><a href="#" class="hover:text-gray-900">Confidentialité</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; 2026 HessBnb - Projet EFREI. Tous droits réservés.
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
