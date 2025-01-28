/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/

import { Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { File } from "./file.entity";
import { Directory } from "./directory.entity";
import { v4 } from "uuid";

@Entity({ tableName: 'users' })
export class User {

    @PrimaryKey({ type: 'uuid', nullable: false, unique: true })
    id: string = v4();

    @Property({ unique: true, nullable: false })
    username!: string;

    @Property({ nullable: false })
    password!: string;

    @Property({ type: 'datetime', defaultRaw: 'current_timestamp()' })
    created_at!: Date;

    @OneToMany(() => File, file => file.file_owner)
    file_owners = new Collection<File>(this);

    @OneToMany(() => Directory, directory => directory.directory_owner)
    directory_owners = new Collection<Directory>(this);

    constructor() {
        this.file_owners = new Collection<File>(this);
        this.directory_owners = new Collection<Directory>(this);
    }
}
