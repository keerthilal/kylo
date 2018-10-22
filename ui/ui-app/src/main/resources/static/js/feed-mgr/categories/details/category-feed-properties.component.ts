import * as _ from "underscore";
import AccessControlService from '../../../services/AccessControlService';
import { EntityAccessControlService } from '../../shared/entity-access-control/EntityAccessControlService';
import { Component, Inject, SimpleChanges } from '@angular/core';
import CategoriesService from '../../services/CategoriesService';
import { CloneUtil } from "../../../common/utils/clone-util";
import { ObjectUtils } from "../../../common/utils/object-utils";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TdDialogService } from "@covalent/core/dialogs";

@Component({
    selector: 'thinkbig-category-feed-properties',
    templateUrl: 'js/feed-mgr/categories/details/category-feed-properties.html'
})
export class CategoryFeedProperties {

    /**
    * Indicates if the properties may be edited.
    */
    allowEdit:boolean = false;
    /**
    * Category data used in "edit" mode.
    * @type {CategoryModel}
    */
    editModel:any;
    /**
    * Indicates if the view is in "edit" mode.
    * @type {boolean} {@code true} if in "edit" mode or {@code false} if in "normal" mode
    */
    isEditable:boolean = false;
    /**
    * Indicates of the category is new.
    * @type {boolean}
    */
    isNew:boolean = true;
    /**
    * Indicates if the properties are valid and can be saved.
    * @type {boolean} {@code true} if all properties are valid, or {@code false} otherwise
    */
    isValid:boolean = true;
    /**
    * Category data used in "normal" mode.
    * @type {CategoryModel}
    */
    model:any;

    /**
     * Manages the Category Feed Properties section of the Category Details page.
     *
     * @constructor
     * @param {AccessControlService} AccessControlService the access control service
     * @param CategoriesService the category service
     */
    constructor(private accessControlService:AccessControlService,
                private entityAccessControlService:EntityAccessControlService, 
                private CategoriesService:CategoriesService,
                private snackBar : MatSnackBar,
                private _tdDialogService : TdDialogService) {

        this.editModel = CategoriesService.newCategory();

        this.model = this.CategoriesService.model;

        //Apply the entity access permissions
        this.accessControlService.hasPermission(AccessControlService.CATEGORIES_ADMIN,this.model,AccessControlService.ENTITY_ACCESS.CATEGORY.EDIT_CATEGORY_DETAILS).then((access:any) =>{
            this.allowEdit = access;
        });
        
        this.CategoriesService.modelSubject.subscribe((newValue: any) => {
            this.isNew = !ObjectUtils.isString(newValue.id)
        });
    }
    /**
         * Switches to "edit" mode.
         */
        onEdit () {
            this.editModel = CloneUtil.deepCopy(this.model);
        };

        /**
         * Saves the category properties.
         */
        onSave () {
            var model = CloneUtil.deepCopy(this.CategoriesService.model);
            model.id = this.model.id;
            model.userFields = this.editModel.userFields;
            model.userProperties = null;

            this.CategoriesService.save(model).then((response:any) =>{
                this.model = this.CategoriesService.model = response;
                this.CategoriesService.setModel(this.CategoriesService.model);
                this.CategoriesService.update(response);
                this.snackBar.open('Saved the Category','OK', {duration : 3000});
            }, (err:any) => {
                this._tdDialogService.openAlert({
                    message : "The category '" + model.name + "' could not be saved. " + err.message,
                    title : "Save Failed",
                    ariaLabel : "Failed to save category",
                    closeButton : "Got it!",
                    disableClose : false
                });
            });
        };
}